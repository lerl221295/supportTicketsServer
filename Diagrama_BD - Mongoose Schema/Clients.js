{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "email": {
        "type": "String",
        "required": true
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId"
    },
    "user_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "name": {
        "type": "String",
        "required": true
    },
    "phones": [
        {
            "type": "String"
        }
    ],
    "about": {
        "type": "String"
    },
    "lastname": {
        "type": "String",
        "required": true
    },
    "twitter_id": {
        "type": "String"
    },
    "facebook_id": {
        "type": "String"
    },
    "address": {
        "type": "String"
    },
    "organization_id": {
        "type": "Schema.Types.ObjectId"
    }
}