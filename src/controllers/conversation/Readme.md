### createConversation

Sample response:

```json
{
    "message": "Conversation started!",
    "conversation": {
        "participants": [
            "1c11e1111e1f1b111d11d11a",
            "2ca2fddba22b2222222d2222"
        ],
        "messages": [
            "3cb33ca3dac333333e3e3333"
        ],
        "startDate": "2019-04-14T13:57:13.933Z",
        "_id": "4cb44ca4dac444444e4e4444",
        "subject": "Test message subject",
        "__v": 0
    }
}
```

### getConversations

Returns some metadata about the user's conversations (message & unreads counts).

Sample response:

```json
{
    "totalMessages": 17,
    "totalUnreads": 0,
    "conversations": [
        {
            "_id": "4a44eddd4444ec4fbcb44444",
            "subject": "Re: UI/UX, CSS/SASS, web accessibility",
            "qtyMessages": 9,
            "qtyUnreads": 0,
            "startDate": "2017-11-19T20:43:17.138Z",
            "participants": [
                {
                    "_id": "11aea111aa1ac1111111e111",
                    "username": "belcurv",
                    "name": "Jay",
                    "avatarUrl": "https://avatars3.githubusercontent.com"
                },
                {
                    "_id": "22adbc2222ee222222e2ad22",
                    "username": "rifkegribenes",
                    "name": "Sarah Schneider",
                    "avatarUrl": "https://avatars3.githubusercontent.com/"
                }
            ],
            "latestMessage": {
                "_id": "3a33eddd3333ec3fbcb33333",
                "updatedAt": "2017-12-08T05:49:14.034Z",
                "createdAt": "2017-11-19T20:47:25.514Z",
                "conversation": "4a44eddd4444ec4fbcb44444",
                "body": "Hi Sarah. Testing the production ver 2 app.",
                "author": "11aea111aa1ac1111111e111",
                "recipient": "22adbc2222ee222222e2ad22",
                "originatedFrom": "connection",
                "__v": 0,
                "unread": false
            }
        },
        {
            "_id": "5a555ad5ad5ae555caffe55a",
            "subject": "Re: Beginning to Intermediate Node",
            "qtyMessages": 3,
            "qtyUnreads": 0,
            "startDate": "2017-11-19T22:38:50.025Z",
            "participants": [
                {
                    "_id": "6a666666ad6ae666caffe666",
                    "username": "dummy4",
                    "name": "Crash Test Dummy 4th",
                    "avatarUrl": "https://cdn.glitch.com/"
                },
                {
                    "_id": "11aea111aa1ac1111111e111",
                    "username": "belcurv",
                    "name": "Jay",
                    "avatarUrl": "https://avatars3.githubusercontent.com/"
                }
            ],
            "latestMessage": {
                "_id": "7a777ad7ad7ae777caffe77b",
                "updatedAt": "2019-03-15T00:40:42.259Z",
                "createdAt": "2017-11-20T03:24:05.436Z",
                "conversation": "5a555ad5ad5ae555caffe55a",
                "body": "Yada yada",
                "author": "6a666666ad6ae666caffe666",
                "recipient": "11aea111aa1ac1111111e111",
                "originatedFrom": "connection",
                "__v": 0,
                "unread": false
            }
        },
        {
            "_id": "8a8ac88ed8fccb888e888888",
            "subject": "Re: Beginning to Intermediate Node",
            "qtyMessages": 5,
            "qtyUnreads": 0,
            "startDate": "2017-11-26T08:44:54.659Z",
            "participants": [
                {
                    "_id": "9a9abecdd9fccb999e999999",
                    "username": "superanonuser2015"
                },
                {
                    "_id": "11aea111aa1ac1111111e111",
                    "username": "belcurv",
                    "name": "Jay",
                    "avatarUrl": "https://avatars3.githubusercontent.com/u/17347977"
                }
            ],
            "latestMessage": {
                "_id": "1a1ac11ed1fccb111e111111",
                "updatedAt": "2019-03-15T00:40:27.009Z",
                "createdAt": "2017-11-26T13:27:10.255Z",
                "conversation": "8a8ac88ed8fccb888e888888",
                "body": "What can I do with express, node",
                "author": "9a9abecdd9fccb999e999999",
                "recipient": "11aea111aa1ac1111111e111",
                "originatedFrom": "connection",
                "__v": 0,
                "unread": false
            }
        }
    ]
}
```

### getConversation

Returns a single conversation with its participants and all messages.

Sample response:

```json
{
    "_id": "4a44eddd4444ec4fbcb44444",
    "subject": "Re: UI/UX, CSS/SASS, web accessibility",
    "participants": [
        {
            "_id": "11aea111aa1ac1111111e111",
            "username": "belcurv",
            "name": "Jay",
            "avatarUrl": "https://avatars3.githubusercontent.com"
        },
        {
            "_id": "22adbc2222ee222222e2ad22",
            "username": "rifkegribenes",
            "name": "Sarah Schneider",
            "avatarUrl": "https://avatars3.githubusercontent.com"
        }
    ],
    "startDate": "2017-11-19T20:43:17.138Z",
    "messages": [
        {
            "_id": "5a11eddd7628ec0fbcb91978",
            "updatedAt": "2017-12-08T05:49:14.034Z",
            "createdAt": "2017-11-19T20:47:25.514Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "Hi Sarah. Testing the production ver 2 app.",
            "author": "11aea111aa1ac1111111e111",
            "recipient": "22adbc2222ee222222e2ad22",
            "originatedFrom": "connection",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11ee207628ec0fbcb9197b",
            "updatedAt": "2019-03-15T00:40:47.264Z",
            "createdAt": "2017-11-19T20:48:32.825Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "check this out, it works!",
            "author": "22adbc2222ee222222e2ad22",
            "recipient": "11aea111aa1ac1111111e111",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11ee3e7628ec0fbcb9197c",
            "updatedAt": "2019-03-15T00:40:47.264Z",
            "createdAt": "2017-11-19T20:49:02.174Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "great news indeed",
            "author": "22adbc2222ee222222e2ad22",
            "recipient": "11aea111aa1ac1111111e111",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11ee587628ec0fbcb9197d",
            "updatedAt": "2019-03-15T00:40:47.267Z",
            "createdAt": "2017-11-19T20:49:28.217Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "ha -- this message got added to a thread",
            "author": "22adbc2222ee222222e2ad22",
            "recipient": "11aea111aa1ac1111111e111",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11ee677628ec0fbcb9197e",
            "updatedAt": "2019-03-15T00:40:47.267Z",
            "createdAt": "2017-11-19T20:49:43.293Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "well maybe not",
            "author": "22adbc2222ee222222e2ad22",
            "recipient": "11aea111aa1ac1111111e111",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11ee737628ec0fbcb9197f",
            "updatedAt": "2017-12-08T05:49:14.036Z",
            "createdAt": "2017-11-19T20:49:55.128Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "No, I initiated a connection request for your post",
            "author": "11aea111aa1ac1111111e111",
            "recipient": "22adbc2222ee222222e2ad22",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11ee7d7628ec0fbcb91980",
            "updatedAt": "2019-03-15T00:40:47.269Z",
            "createdAt": "2017-11-19T20:50:05.796Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "yes, it is working",
            "author": "22adbc2222ee222222e2ad22",
            "recipient": "11aea111aa1ac1111111e111",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11eec47628ec0fbcb91981",
            "updatedAt": "2019-03-15T00:40:47.270Z",
            "createdAt": "2017-11-19T20:51:16.325Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "check it out we got a new post",
            "author": "22adbc2222ee222222e2ad22",
            "recipient": "11aea111aa1ac1111111e111",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        },
        {
            "_id": "5a11eefb7628ec0fbcb91982",
            "updatedAt": "2017-12-08T05:49:14.038Z",
            "createdAt": "2017-11-19T20:52:11.489Z",
            "conversation": "4a44eddd4444ec4fbcb44444",
            "body": "Yeah. It's awesome.",
            "author": "11aea111aa1ac1111111e111",
            "recipient": "22adbc2222ee222222e2ad22",
            "originatedFrom": "conversation",
            "__v": 0,
            "unread": false
        }
    ]
}
```