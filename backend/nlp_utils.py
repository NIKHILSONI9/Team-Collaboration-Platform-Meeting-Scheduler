import dateparser
import re
from datetime import datetime, timedelta

def extract_meeting_info(chat_history):
    print("\n=== NLP DEBUGGING STARTED ===")
    print("Processing chat messages:")
    for msg in chat_history:
        print(f"- {msg['sender_id']}: {msg['content']}")
    
    # Enhanced patterns to capture all time references
    day_pattern = r'\b(?:next\s+)?(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun|tomorrow|today)\b'
    time_pattern = r'\b\d{1,2}(?::\d{2})?\s?[AP]M\b'
    
    participants = set()
    days = []
    times = []
    
    for message in chat_history:
        content = message['content'].lower()
        sender = message['sender_id']
        participants.add(sender)
        
        # Find all day references
        day_matches = re.findall(day_pattern, content, re.IGNORECASE)
        days.extend(day_matches)
        
        # Find all time references
        time_matches = re.findall(time_pattern, content, re.IGNORECASE)
        times.extend(time_matches)
    
    print(f"Detected days: {days}")
    print(f"Detected times: {times}")

    # Process the time
    meeting_time = None
    time_str = None
    
    # If we have both days and times, combine them
    if days and times:
        time_str = f"{days[-1]} at {times[-1]}"
    elif times:  # Only time found, assume soonest possible future time
        time_str = times[-1]
        # Check if time is in past
        proposed_time = dateparser.parse(time_str)
        if proposed_time and proposed_time < datetime.now():
            time_str = "tomorrow at " + time_str
    
    if time_str:
        meeting_time = dateparser.parse(
            time_str,
            settings={
                'PREFER_DATES_FROM': 'future',
                'RELATIVE_BASE': datetime.now(),
                'DATE_ORDER': 'DMY'
            }
        )
    
    print(f"Parsed meeting time: {meeting_time}")
    print("=== NLP DEBUGGING COMPLETE ===\n")
    
    return {
        "time": meeting_time.isoformat() if meeting_time else None,
        "participants": list(participants),
        "title": "Team Meeting"
    }