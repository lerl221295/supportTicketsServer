{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "ticket_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "agents": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ],
    "messages": [
        {
            "time": {
                "type": "Date"
            },
            "text": {
                "type": "String"
            },
            "agent_id": {
                "type": "Schema.Types.ObjectId"
            }
        }
    ]
}