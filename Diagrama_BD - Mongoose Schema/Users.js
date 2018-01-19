{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "password": {
        "type": "String",
        "required": true
    },
    "notifications": [
        {
            "_id": {
                "type": "String"
            },
            "ticket_id": {
                "type": "Schema.Types.ObjectId",
                "required": true
            },
            "time": {
                "type": "Date",
                "required": true
            },
            "text": {
                "type": "String",
                "required": true
            },
            "readed": {
                "type": "Boolean"
            }
        }
    ]
}