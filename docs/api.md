# Overview
This module provides utilities for handling and writing Server-Sent Events (SSE) messages. It defines interfaces for messages, event options, and an event notifier, as well as a class for writing these messages.


# Interfaces and Types
## Message:

- `data`: The main content of the message. It can be a string or an object.
- `comment` (optional): A comment associated with the message.
- `event` (optional): The type of event for this message.
- `id` (optional): An identifier for the message.
- `retry` (optional): A number indicating how long to wait before retrying.

## EventOptions:

- `beforeFn` (optional): A function to be executed before the main event function.
- `afterFn` (optional): A function to be executed after the main event function.

## EventNotifier:
This interface defines methods for different types of events: `update`, `complete`, `error`, and `close`. Each method accepts a message and optional event options.
## CustomFn:
A type representing a custom function that accepts data and returns any value.
## Class: Writer
This class implements the EventNotifier interface and provides methods to write SSE messages.

### Constructor:

- `writer`: A writable stream writer.
- `encoder`: A text encoder to encode messages.

### Methods:

- `writeMessage`: Writes the provided message to the stream.
- `update`: Writes an update message.
- `complete`: Writes a completion message and closes the writer.
- `error`: Writes an error message and closes the writer.
- `close`: Closes the writer without writing a message.

## Factory Function
`getSSEWriter`: A utility function that returns a new instance of the Writer class.
