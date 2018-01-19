{
    "type": {
        "type": "String",
        "enum": [
            "TEXT",
            "TEXTAREA",
            "NUMBER",
            "DATE",
            "SELECT",
            "CHECKBOX"
        ],
        "required": true
    },
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "default": {
        "type": "Boolean"
    },
    "key": {
        "type": "String",
        "required": true
    },
    "position": {
        "type": "Number",
        "required": true
    },
    "ent_field": {
        "type": "String"
    },
    "clientVisible": {
        "type": "Boolean"
    },
    "options": [
        {
            "key": {
                "type": "String",
                "required": true
            },
            "label": {
                "type": "String",
                "required": true
            }
        }
    ]
}