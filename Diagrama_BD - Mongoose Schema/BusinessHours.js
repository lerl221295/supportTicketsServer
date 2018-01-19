{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "mode": {
        "type": "String",
        "enum": [
            "TWENTYFOUR_SEVEN",
            "SAME_FOR_DAYS",
            "CUSTOMIZED"
        ],
        "required": true
    },
    "holidays": [
        {
            "name": {
                "type": "String",
                "required": true
            },
            "day": {
                "type": "Number",
                "min": 1,
                "max": 31,
                "required": true
            },
            "month": {
                "type": "Number",
                "min": 1,
                "max": 12,
                "required": true
            }
        }
    ],
    "working_days": [
        {
            "day": {
                "type": "String",
                "enum": [
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY"
                ],
                "required": true
            },
            "workeable": {
                "type": "Boolean"
            },
            "horary": {
                "start": {
                    "hour": {
                        "type": "Number"
                    },
                    "minutes": {
                        "type": "Number"
                    }
                },
                "end": {
                    "hour": {
                        "type": "Number"
                    },
                    "minutes": {
                        "type": "Number"
                    }
                }
            }
        }
    ],
    "horary": {
        "start": {
            "hour": {
                "type": "Number"
            },
            "minutes": {
                "type": "Number"
            }
        },
        "end": {
            "hour": {
                "type": "Number"
            },
            "minutes": {
                "type": "Number"
            }
        }
    },
    "week_days": [
        {
            "type": "String",
            "enum": [
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY"
            ]
        }
    ]
}