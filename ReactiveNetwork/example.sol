// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IEventEmitter
 * @dev Interface for contracts that emit cross-chain events
 */
interface IEventEmitter {
    event CrossChainEvent(
        uint256 indexed sourceChainId,
        address indexed emitter,
        bytes data
    );
}

/**
 * @title ReactiveContract
 * @dev Example implementation of a reactive contract that processes cross-chain events
 */
contract ReactiveContract {
    // Structure to store event data
    struct EventData {
        uint256 sourceChainId;
        address emitter;
        bytes data;
        bool processed;
    }
    
    // Queue of events to be processed
    EventData[] public eventQueue;
    
    // Mapping to track processed events
    mapping(bytes32 => bool) public processedEvents;
    
    // Event to signal when reactive processing occurs
    event ReactiveExecution(bytes32 indexed eventHash, bytes result);
    
    /**
     * @dev Receives cross-chain events and queues them for processing
     * @param sourceChainId The ID of the chain where the event originated
     * @param emitter The address that emitted the event
     * @param data The event data
     */
    function receiveEvent(
        uint256 sourceChainId,
        address emitter,
        bytes calldata data
    ) external {
        bytes32 eventHash = keccak256(
            abi.encodePacked(sourceChainId, emitter, data)
        );
        
        require(!processedEvents[eventHash], "Event already processed");
        
        eventQueue.push(
            EventData({
                sourceChainId: sourceChainId,
                emitter: emitter,
                data: data,
                processed: false
            })
        );
    }
    
    /**
     * @dev Processes queued events
     * @param maxEvents Maximum number of events to process in this call
     */
    function processEvents(uint256 maxEvents) external {
        uint256 eventsToProcess = Math.min(maxEvents, eventQueue.length);
        
        for (uint256 i = 0; i < eventsToProcess; i++) {
            EventData storage eventData = eventQueue[i];
            
            if (!eventData.processed) {
                bytes32 eventHash = keccak256(
                    abi.encodePacked(
                        eventData.sourceChainId,
                        eventData.emitter,
                        eventData.data
                    )
                );
                
                // Process the event and get result
                bytes memory result = _processEvent(eventData);
                
                // Mark as processed
                eventData.processed = true;
                processedEvents[eventHash] = true;
                
                // Emit result
                emit ReactiveExecution(eventHash, result);
            }
        }
        
        // Clean up processed events
        _cleanupProcessedEvents();
    }
    
    /**
     * @dev Internal function to process a single event
     * @param eventData The event data to process
     * @return result The result of processing the event
     */
    function _processEvent(EventData memory eventData) internal returns (bytes memory) {
        // Example processing logic - replace with actual business logic
        if (eventData.sourceChainId == 1) {
            // Process Ethereum mainnet events
            return _processMainnetEvent(eventData.data);
        } else {
            // Process other chain events
            return _processOtherChainEvent(eventData.data);
        }
    }
    
    /**
     * @dev Process events from Ethereum mainnet
     */
    function _processMainnetEvent(bytes memory data) internal returns (bytes memory) {
        // Implement mainnet-specific event processing
        return abi.encode("Processed mainnet event");
    }
    
    /**
     * @dev Process events from other chains
     */
    function _processOtherChainEvent(bytes memory data) internal returns (bytes memory) {
        // Implement processing for other chain events
        return abi.encode("Processed other chain event");
    }
    
    /**
     * @dev Removes processed events from the queue
     */
    function _cleanupProcessedEvents() internal {
        uint256 i = 0;
        while (i < eventQueue.length) {
            if (eventQueue[i].processed) {
                // Remove processed event by swapping with last element and reducing length
                eventQueue[i] = eventQueue[eventQueue.length - 1];
                eventQueue.pop();
            } else {
                i++;
            }
        }
    }
}

/**
 * @title ReactiveOracle
 * @dev Example of a reactive oracle that feeds data to reactive contracts
 */
contract ReactiveOracle is IEventEmitter {
    // Mapping of authorized data providers
    mapping(address => bool) public authorizedProviders;
    
    // Owner of the oracle
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedProviders[msg.sender], "Not authorized");
        _;
    }
    
    /**
     * @dev Authorizes a provider to submit data
     */
    function authorizeProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = true;
    }
    
    /**
     * @dev Submits data to be propagated across chains
     */
    function submitData(bytes calldata data) external onlyAuthorized {
        emit CrossChainEvent(
            block.chainid,
            msg.sender,
            data
        );
    }
}