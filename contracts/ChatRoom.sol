// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Note: FHEVM uses bytes for encrypted data storage
// Encryption/decryption happens on the client side using fhevmjs

/**
 * @title ChatRoom
 * @dev Main contract for managing chat rooms, users, and encrypted messages
 */
contract ChatRoom {
    // User profile structure
    struct UserProfile {
        string nickname;
        bool exists;
        uint256 createdAt;
    }

    // Room structure
    struct Room {
        string name;
        string description;
        address creator;
        uint256 createdAt;
        bool exists;
    }

    // Message structure with encrypted content
    struct Message {
        address sender;
        uint256 roomId;
        bytes encryptedContent; // Encrypted message content (bytes for FHEVM)
        uint256 timestamp;
        uint256 messageId;
        bool edited;
        uint256 editTimestamp;
    }

    // Mapping: user address => UserProfile
    mapping(address => UserProfile) public userProfiles;
    
    // Mapping: roomId => Room
    mapping(uint256 => Room) public rooms;
    
    // Mapping: roomId => messageId => Message
    mapping(uint256 => mapping(uint256 => Message)) public messages;
    
    // Mapping: roomId => messageCount
    mapping(uint256 => uint256) public roomMessageCounts;
    
    // Total rooms counter
    uint256 public totalRooms;
    
    // Total messages counter (global)
    uint256 public totalMessages;

    // Events
    event UserRegistered(address indexed user, string nickname);
    event NicknameUpdated(address indexed user, string newNickname);
    event RoomCreated(uint256 indexed roomId, string name, address creator);
    event MessageSent(
        uint256 indexed roomId,
        uint256 indexed messageId,
        address indexed sender,
        uint256 timestamp
    );
    event MessageEdited(
        uint256 indexed roomId,
        uint256 indexed messageId,
        address indexed sender,
        uint256 timestamp
    );

    /**
     * @dev Register a new user with nickname
     * @param nickname The nickname for the user
     */
    function registerUser(string memory nickname) external {
        require(!userProfiles[msg.sender].exists, "User already registered");
        require(bytes(nickname).length > 0, "Nickname cannot be empty");
        require(bytes(nickname).length <= 32, "Nickname too long");

        userProfiles[msg.sender] = UserProfile({
            nickname: nickname,
            exists: true,
            createdAt: block.timestamp
        });

        emit UserRegistered(msg.sender, nickname);
    }

    /**
     * @dev Update user nickname
     * @param newNickname The new nickname
     */
    function updateNickname(string memory newNickname) external {
        require(userProfiles[msg.sender].exists, "User not registered");
        require(bytes(newNickname).length > 0, "Nickname cannot be empty");
        require(bytes(newNickname).length <= 32, "Nickname too long");

        userProfiles[msg.sender].nickname = newNickname;
        emit NicknameUpdated(msg.sender, newNickname);
    }

    /**
     * @dev Get user nickname
     * @param user Address of the user
     * @return nickname The user's nickname
     */
    function getUserNickname(address user) external view returns (string memory) {
        require(userProfiles[user].exists, "User not registered");
        return userProfiles[user].nickname;
    }

    /**
     * @dev Check if user is registered
     * @param user Address of the user
     * @return exists True if user is registered
     */
    function isUserRegistered(address user) external view returns (bool) {
        return userProfiles[user].exists;
    }

    /**
     * @dev Create a new chat room
     * @param name Room name
     * @param description Room description
     * @return roomId The ID of the created room
     */
    function createRoom(string memory name, string memory description) external returns (uint256) {
        require(userProfiles[msg.sender].exists, "User must be registered");
        require(bytes(name).length > 0, "Room name cannot be empty");
        require(bytes(name).length <= 64, "Room name too long");

        uint256 roomId = totalRooms;
        rooms[roomId] = Room({
            name: name,
            description: description,
            creator: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        totalRooms++;
        emit RoomCreated(roomId, name, msg.sender);
        return roomId;
    }

    /**
     * @dev Get room information
     * @param roomId The room ID
     * @return name Room name
     * @return description Room description
     * @return creator Room creator address
     * @return createdAt Creation timestamp
     */
    function getRoom(uint256 roomId) external view returns (
        string memory name,
        string memory description,
        address creator,
        uint256 createdAt
    ) {
        require(rooms[roomId].exists, "Room does not exist");
        Room memory room = rooms[roomId];
        return (room.name, room.description, room.creator, room.createdAt);
    }

    /**
     * @dev Send an encrypted message to a room
     * @param roomId The room ID
     * @param encryptedContent The encrypted message content (bytes)
     * @return messageId The ID of the sent message
     */
    function sendMessage(uint256 roomId, bytes calldata encryptedContent) external returns (uint256) {
        require(userProfiles[msg.sender].exists, "User must be registered");
        require(rooms[roomId].exists, "Room does not exist");

        uint256 messageId = roomMessageCounts[roomId];
        messages[roomId][messageId] = Message({
            sender: msg.sender,
            roomId: roomId,
            encryptedContent: encryptedContent,
            timestamp: block.timestamp,
            messageId: messageId,
            edited: false,
            editTimestamp: 0
        });

        roomMessageCounts[roomId]++;
        totalMessages++;

        emit MessageSent(roomId, messageId, msg.sender, block.timestamp);
        return messageId;
    }

    /**
     * @dev Edit an existing message
     * @param roomId The room ID
     * @param messageId The message ID
     * @param newEncryptedContent The new encrypted content
     */
    function editMessage(
        uint256 roomId,
        uint256 messageId,
        bytes calldata newEncryptedContent
    ) external {
        require(userProfiles[msg.sender].exists, "User must be registered");
        require(rooms[roomId].exists, "Room does not exist");
        require(messages[roomId][messageId].sender == msg.sender, "Only sender can edit");
        require(messages[roomId][messageId].timestamp > 0, "Message does not exist");

        messages[roomId][messageId].encryptedContent = newEncryptedContent;
        messages[roomId][messageId].edited = true;
        messages[roomId][messageId].editTimestamp = block.timestamp;

        emit MessageEdited(roomId, messageId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get message count for a room
     * @param roomId The room ID
     * @return count The number of messages in the room
     */
    function getRoomMessageCount(uint256 roomId) external view returns (uint256) {
        return roomMessageCounts[roomId];
    }

    /**
     * @dev Get message sender and metadata (content is encrypted)
     * @param roomId The room ID
     * @param messageId The message ID
     * @return sender Message sender address
     * @return timestamp Message timestamp
     * @return edited Whether message was edited
     * @return editTimestamp Edit timestamp (0 if not edited)
     */
    function getMessageMetadata(
        uint256 roomId,
        uint256 messageId
    ) external view returns (
        address sender,
        uint256 timestamp,
        bool edited,
        uint256 editTimestamp
    ) {
        require(messages[roomId][messageId].timestamp > 0, "Message does not exist");
        Message memory msgData = messages[roomId][messageId];
        return (msgData.sender, msgData.timestamp, msgData.edited, msgData.editTimestamp);
    }

    /**
     * @dev Get encrypted message content (requires FHE decryption on client)
     * @param roomId The room ID
     * @param messageId The message ID
     * @return encryptedContent The encrypted message content
     */
    function getEncryptedMessage(
        uint256 roomId,
        uint256 messageId
    ) external view returns (bytes memory) {
        require(messages[roomId][messageId].timestamp > 0, "Message does not exist");
        return messages[roomId][messageId].encryptedContent;
    }
}

