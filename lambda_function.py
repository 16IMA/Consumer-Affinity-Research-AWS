import json
import boto3
import os
from datetime import datetime, timezone

s3 = boto3.client('s3')

BUCKET_NAME = os.environ['S3_BUCKET_NAME']

REQUIRED_FIELDS = [
    'response_id', 'submitted_at', 'age_range', 'city', 'country',
    'first_purchase', 'category', 'purchase_amount_range', 'purchase_channel',
    'quality_score', 'delivery_score', 'support_score', 'ease_score',
    'value_score', 'buy_again', 'nps_score', 'source_channel'
]

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}


def lambda_handler(event, context):
    # Preflight CORS request from the browser
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
    except (json.JSONDecodeError, TypeError):
        return _error(400, 'Invalid JSON body')

    missing = [f for f in REQUIRED_FIELDS if f not in body or body[f] == '']
    if missing:
        return _error(400, f'Missing fields: {", ".join(missing)}')

    # Build the S3 key: surveys/2026/04/30/<response_id>.json
    try:
        date = datetime.fromisoformat(body['submitted_at'].replace('Z', '+00:00'))
    except (ValueError, KeyError):
        date = datetime.now(timezone.utc)

    s3_key = (
        f"surveys/{date.year:04d}/{date.month:02d}/{date.day:02d}"
        f"/{body['response_id']}.json"
    )

    try:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=json.dumps(body, ensure_ascii=False),
            ContentType='application/json'
        )
    except Exception as e:
        print(f"S3 error: {e}")
        return _error(500, 'Failed to save response')

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'message': 'Response saved', 'key': s3_key})
    }


def _error(status, message):
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': message})
    }
