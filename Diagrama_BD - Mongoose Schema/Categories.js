{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "name": {
        "type": "String",
        "required": true
    },
    "articles": [
        {
            "description": {
                "type": "String"
            },
            "user_id": {
                "type": "Schema.Types.ObjectId",
                "required": true
            },
            "name": {
                "type": "String",
                "required": true
            },
            "created_at": {
                "type": "Date",
                "required": true
            }
        }
    ]
}