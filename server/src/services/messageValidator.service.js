import Messages from "../models/message.model.js";

export const validateMessage = (messageData) => {
    const message = new Messages(messageData);

    return message.validateSync({
        pathsToSkip: ['fromUser', 'toUser']
    });
};