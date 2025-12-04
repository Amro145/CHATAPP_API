import User from "../models/auth.model.js";
import { FriendRequest } from "../models/friendRequest.mode.js";

export const getFriends = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(401).json({ message: 'Unauthorized! No user ID provided.' });
        }
        const friends = await User.findById(id).select("friends").populate('friends', 'name email bio profilePic');
        // Adjust the fields as needed                          

        if (!friends) {
            return res.status(400).json({ message: 'No friends found' });
        }
        return res.status(200).json(friends);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }
}
export const suggestedFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const currentUser = await User.findById(userId).select("friends");
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized! No user ID provided.' });
        }
        const pendingFriendRequest = await FriendRequest.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            status: 'pending'
        }).select("sender receiver")
        const requestedFriendIds = pendingFriendRequest.map(request => {
            return request.sender.equals(userId) ? request.receiver : request.sender;
        });

        const suggestedFriends = await User.find(
            {
                $and: [
                    { _id: { $ne: userId } },
                    { _id: { $nin: currentUser.friends } },
                    { _id: { $nin: requestedFriendIds } },
                    { isVerified: true },
                    { isAdmin: false },
                    { onboarding: true }
                ]
            }
        ).select("name email bio profilePic gender");

        if (!suggestedFriends) {
            return res.status(404).json({ message: 'No suggested friends found' });
        }
        return res.status(200).json(suggestedFriends);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }
}
export const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const friendId = req.params.id;

        if (!userId || !friendId) {
            return res.status(400).json({ message: 'User ID and Friend ID are required' });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User or Friend not found' });
        }

        // Check if the friend request already exists
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ message: "you can't send friend request to Your friend" });
        }
        if (friend.isVerified === false) {
            return res.status(400).json({ message: 'Friend request not sent, user is not verified' });
        }
        if (friend.isAdmin === true) {
            return res.status(400).json({ message: 'Friend request not sent, user is an admin' });
        }
        if (friend.onboarding === false) {
            return res.status(400).json({ message: 'Friend request not sent, user is not onboarded' });
        }

        const existingRequest = await FriendRequest.findOne({
            sender: userId,
            receiver: friendId,
            status: 'pending'

        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists' });
        }

        const friendRequest = new FriendRequest({
            sender: userId,
            receiver: friendId,
            status: 'pending'
        });

        await friendRequest.save();

        return res.status(200).json({ message: 'Friend request sent successfully', friendRequest });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }
}
export const getFriendRequests = async (req, res) => {
    try {
        const myId = req.userId;
        if (!myId) {
            return res.status(401).json({ message: 'Unauthorized! No user ID provided.' });
        }

        const friendRequests = await FriendRequest.find({ receiver: myId, status: 'pending' })
            .populate('sender', 'name bio email profilePic')
        if (!friendRequests) {
            return res.status(404).json({ message: 'No friend requests found' });
        }
        if (friendRequests.length === 0) {
            return res.status(200).json([]);

        }

        return res.status(200).json(friendRequests);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }
}
export const acceptFriendRequest = async (req, res) => {
    try {
        const myId = req.userId;
        const friendRequestId = req.params.id;

        if (!myId || !friendRequestId) {
            return res.status(400).json({ message: 'User ID and Friend Request ID are required' });
        }
        const friendRequest = await FriendRequest.findById(friendRequestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }
        if (friendRequest.receiver.toString() !== myId) {
            return res.status(403).json({ message: 'You are not authorized to accept this friend request' });
        }
        if (friendRequest.status === 'accepted') {
            return res.status(400).json({ message: 'Friend request already accepted' });
        }
        friendRequest.status = 'accepted';
        await friendRequest.save();
        const user = await User.findById(myId);
        const friend = await User.findById(friendRequest.sender);
        if (!user || !friend) {
            return res.status(404).json({ message: 'User or Friend not found' });
        }
        user.friends.push(friend._id);
        friend.friends.push(user._id);
        await user.save();
        await friend.save();
        const userFriends = user.friends;
        const mydata = await User.findById(myId)
        return res.status(200).json(mydata);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}
export const getOutgoingFriendRequests = async (req, res) => {
    try {
        const myId = req.userId;
        const outgoingRequests = await FriendRequest.find({ sender: myId, status: 'pending' })
            .populate('receiver', 'name email profilePic')

        if (!outgoingRequests || outgoingRequests.length === 0) {
            return res.status(404).json({ message: 'No outgoing friend requests found' });
        }
        return res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }
}
export const getUser = async (req, res) => {
    try {
        const userId = req.params.id; // Extract userId from params
        const user = await User.findById(userId).select("name email profilePic friends")
            .populate('friends', 'name email profilePic bio ');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllFriendRequests = async (req, res) => {
    try {
        const allFriendRequests = await FriendRequest.find()
            .populate('sender', 'name email profilePic')
            .populate('receiver', 'name email profilePic')

        if (!allFriendRequests || allFriendRequests.length === 0) {
            return res.status(404).json({ message: 'No friend requests found' });
        }
        return res.status(200).json(allFriendRequests);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }
}