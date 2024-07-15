import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
    // console.log("msg sent", req.params.id);
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id   // for this we will be using middleware
        
        let conversation =await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        })
    
        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }
    
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        })

        await newMessage.save();

        if(newMessage){
            conversation.messages.push(newMessage._id);
            //await conversation.save();
        }

        //SOCKET IO FUNCTIONALITY WILL GO HERE


        //this will run in parallel
        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(201).json(newMessage);
    
    } catch (error) {
        console.log("Error in sendMessage controller: " , error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getMessage = async(req, res) => {
    try {
        const { id:userToChatId} = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId]},
        }).populate("messages");  //NOT REFERENCE BUT ACTUAL MESSAGE

        if(!conversation){
            return res.status(200).json({});
        }

        const messages = conversation.messages;
        
        res.status(200).json(conversation.messages);

    } catch (error) {
        console.log("Error in getMessage controller: " , error.message);
        res.status(500).json({error: "Internal server error"});
    }
}