import json
import math

# 1. Load the raw StatsBomb event data
with open('match_8658.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

ui_payload = []
cumulative_xT = 0.0

# 2. Extract only passes and shots that have location data
for event in events:
    event_type = event.get('type', {}).get('name')
    
    if event_type in ['Pass', 'Shot'] and 'location' in event:
        minute = event['minute']
        second = event['second']
        location = event['location'] # [X, Y] coordinates
        
        # Simulated xT / xG calculation for the visualization
        xT_value = 0.02 if event_type == 'Pass' else 0.45
        cumulative_xT += xT_value
        
        ui_payload.append({
            "time": minute + (second / 60.0),
            "type": event_type,
            "x": location[0],
            "y": location[1],
            "rolling_xT": round(cumulative_xT, 2)
        })

# 3. Output to the React 'public' folder so Vite can serve it
output_path = 'public/match_data.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(ui_payload, f)

print(f"Success! Processed {len(ui_payload)} events and saved to {output_path}")