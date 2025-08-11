import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dummy_data import groups, users, messages
from nlp_utils import extract_meeting_info
from email_utils import send_email

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# MongoDB Atlas connection with error handling
try:
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise ValueError("MONGO_URI not found in environment variables")
    
    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,
        socketTimeoutMS=30000,
        connectTimeoutMS=30000
    )
    # Test the connection
    client.server_info()
    print("✅ Successfully connected to MongoDB Atlas!")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    exit(1)

# Database setup
db = client.meeting_scheduler
users_col = db.users
groups_col = db.groups
messages_col = db.messages
meetings_col = db.meetings

# Initialize with dummy data if collections are empty
try:
    if groups_col.count_documents({}) == 0:
        groups_col.insert_many(groups)
    if users_col.count_documents({}) == 0:
        users_col.insert_many(users)
    if messages_col.count_documents({}) == 0:
        messages_col.insert_many(messages)
except Exception as e:
    print(f"⚠️ Error initializing data: {e}")

# API Endpoints
@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = list(users_col.find({}, {'_id': 0}))
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user', methods=['POST'])
def create_user():
    data = request.json
    try:
        # Validate required fields
        if not data.get('user_id') or not data.get('name') or not data.get('email'):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if user_id already exists
        if users_col.find_one({"user_id": data['user_id']}):
            return jsonify({"error": "User ID already exists"}), 400
        
        # Insert the user
        result = users_col.insert_one(data)
        return jsonify({
            "status": "success",
            "inserted_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/groups', methods=['GET'])
def get_groups():
    groups = list(groups_col.find({}, {'_id': 0}))
    return jsonify(groups)

@app.route('/messages/<group_id>', methods=['GET', 'DELETE'])
def handle_messages(group_id):
    if request.method == 'GET':
        messages = list(messages_col.find({"chat_id": group_id}, {'_id': 0}))
        return jsonify(messages)
    elif request.method == 'DELETE':
        result = messages_col.delete_many({"chat_id": group_id})
        return jsonify({
            "status": "success", 
            "deleted_count": result.deleted_count
        })

@app.route('/message', methods=['POST'])
def add_message():
    data = request.json
    data['timestamp'] = datetime.now().isoformat()
    messages_col.insert_one(data)
    return jsonify({"status": "success"}), 201

@app.route('/schedule', methods=['POST'])
def schedule_meeting():
    try:
        data = request.json
        group_id = data['chat_id']
        
        # Get chat history
        chat_history = list(messages_col.find({"chat_id": group_id}))
        if not chat_history:
            return jsonify({"error": "No messages found in chat"}), 400
        
        # Extract meeting info
        meeting_info = extract_meeting_info(chat_history)
        if not meeting_info or not meeting_info.get("time"):
            return jsonify({
                "error": "Could not determine meeting time",
                "suggestion": "Try being more specific (e.g. 'Let's meet Friday at 3 PM')"
            }), 400
        
        # Create meeting
        meeting_data = {
            "chat_id": group_id,
            "title": meeting_info["title"],
            "scheduled_time": meeting_info["time"],
            "participants": meeting_info["participants"],
            "status": "scheduled",
            "created_at": datetime.now().isoformat()
        }
        
        # Save to database
        result = meetings_col.insert_one(meeting_data)
        meeting_data['_id'] = str(result.inserted_id)
        
        # Send notifications
        for participant in meeting_info["participants"]:
            user = users_col.find_one({"user_id": participant})
            if user and user.get('email'):
                send_email(
                    user['email'],
                    f"Meeting Scheduled: {meeting_data['title']}",
                    f"""
                    Meeting Details:
                    - Time: {meeting_data['scheduled_time']}
                    - Participants: {', '.join(meeting_data['participants'])}
                    """
                )
        
        return jsonify(meeting_data), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/meetings/<group_id>', methods=['GET', 'DELETE'])
def meetings_handler(group_id):
    if request.method == 'GET':
        meetings = list(meetings_col.find({"chat_id": group_id}, {'_id': 0}))
        return jsonify(meetings)
    elif request.method == 'DELETE':
        result = meetings_col.delete_many({"chat_id": group_id})
        return jsonify({
            "status": "success",
            "deleted_count": result.deleted_count
        })

@app.route('/test-mongo')
def test_mongo():
    try:
        # Try a simple query
        count = users_col.count_documents({})
        return jsonify({
            "status": "success",
            "user_count": count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Debugging: Print all registered routes
print("\n=== Registered Routes ===")
for rule in app.url_map.iter_rules():
    print(f"{rule.rule} -> {rule.methods}")
print("=======================\n")

if __name__ == '__main__':
    app.run(debug=True, port=5000)