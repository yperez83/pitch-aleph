import json
import urllib.request

def fetch_and_slice(match_id, output_file, max_minute, target_team):
    print(f"Downloading match {match_id} data...")
    url = f"https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/{match_id}.json"
    response = urllib.request.urlopen(url)
    events = json.loads(response.read().decode('utf-8'))
    
    ui_payload = []
    cumulative_xT = 0.0
    
    for event in events:
        minute = event.get('minute', 0)
        second = event.get('second', 0)
        
        if minute > max_minute:
            continue
            
        event_type = event.get('type', {}).get('name')
        if event_type in ['Pass', 'Shot'] and 'location' in event:
            team = event.get('team', {}).get('name', '')
            if team == target_team:
                xT_value = 0.02 if event_type == 'Pass' else 0.45
                cumulative_xT += xT_value
                ui_payload.append({
                    "time": minute + (second / 60.0),
                    "type": event_type,
                    "x": event['location'][0],
                    "y": event['location'][1],
                    "rolling_xT": round(cumulative_xT, 2)
                })

    with open(f'public/{output_file}', 'w', encoding='utf-8') as f:
        json.dump(ui_payload, f)
    print(f"Exported {output_file}!")

# Match 3857289: Argentina vs Saudi Arabia (Slice at 52 mins, tracking KSA momentum)
fetch_and_slice("3857289", "match_data_ksa.json", 52, "Saudi Arabia")

# Match 3869420: Netherlands vs Argentina (Slice at 90 mins, tracking NED tactical rupture)
fetch_and_slice("3869420", "match_data_ned.json", 90, "Netherlands")