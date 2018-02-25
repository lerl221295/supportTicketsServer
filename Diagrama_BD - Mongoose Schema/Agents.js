let obj = {
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
    "profession": {
        "type": "String"
    },
    "supplier_id": {
        "type": "Schema.Types.ObjectId"
    }
}