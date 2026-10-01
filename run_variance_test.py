import json
import urllib.request

# Match ID 7567 is Germany vs South Korea (2018 World Cup)
url = "https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/7567.json"
print("Downloading 2018 GER vs KOR data...")
response = urllib.request.urlopen(url)
events = json.loads(response.read().decode('utf-8'))

ui_payload = []
cumulative_xT = 0.0

# Slice up to the 80th minute where Germany was heavily dominating
for event in events:
    minute = event.get('minute', 0)
    second = event.get('second', 0)
    
    if minute > 80:
        continue
        
    event_type = event.get('type', {}).get('name')
    if event_type in ['Pass', 'Shot'] and 'location' in event:
        location = event['location']
        team = event.get('team', {}).get('name', '')
        
        # Calculate momentum specifically for Germany
        if team == 'Germany':
            xT_value = 0.02 if event_type == 'Pass' else 0.45
            cumulative_xT += xT_value
            
            ui_payload.append({
                "time": minute + (second / 60.0),
                "type": event_type,
                "x": location[0],
                "y": location[1],
                "rolling_xT": round(cumulative_xT, 2)
            })

# Save specifically for the 2018 route in the React app
with open('public/match_data_2018.json', 'w', encoding='utf-8') as f:
    json.dump(ui_payload, f)

print("Success! Exported 2018 tail-risk data to public/match_data_2018.json")