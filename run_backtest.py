import json
import urllib.request

# 1. Download 2022 World Cup Final (Argentina vs France)
match_id = "3869685"
url = f"https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/{match_id}.json"
print("Downloading 2022 World Cup Final data...")
response = urllib.request.urlopen(url)
events = json.loads(response.read().decode('utf-8'))

ui_payload = []
cumulative_xT = 0.0

# 2. Slice to the first 25% (22.5 minutes)
for event in events:
    minute = event.get('minute', 0)
    second = event.get('second', 0)
    
    # THE BLINDFOLD: Hide the remaining 75% of the game
    if minute > 22 or (minute == 22 and second > 30):
        continue
        
    event_type = event.get('type', {}).get('name')
    if event_type in ['Pass', 'Shot'] and 'location' in event:
        location = event['location']
        
        xT_value = 0.02 if event_type == 'Pass' else 0.45
        cumulative_xT += xT_value
        
        ui_payload.append({
            "time": minute + (second / 60.0),
            "type": event_type,
            "x": location[0],
            "y": location[1],
            "rolling_xT": round(cumulative_xT, 2)
        })

# 3. Output the blinded data to the React frontend
with open('public/match_data.json', 'w', encoding='utf-8') as f:
    json.dump(ui_payload, f)

print(f"Success! Exported {len(ui_payload)} events. The rest of the match is hidden.")