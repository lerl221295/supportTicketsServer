{
    "type": {
        "type": "String",
        "enum": [
            "DISPATCHER",
            "OBSERVER",
            "SUPERVISOR",
            "SCENARIO"
        ],
        "required": true
    },
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "automation_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "field_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "param_key": {
        "type": "String"
    },
    "condition_operator": {
        "type": "String",
        "enum": [
            "IS",
            "NOT",
            "CONTAINS",
            "NOT_CONTAINS",
            "STARTS",
            "ENDS",
            "HIGHER",
            "HIGHER_OR_EQUAL",
            "LESS",
            "LESS_OR_EQUAL"
        ]
    },
    "value": {
        "type": "String"
    },
    "values": [
        {
            "type": "String"
        }
    ]
}