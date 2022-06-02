import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';

// modular event types
// import { ToastEvents } from '../toaster'; // can modularize this way

// compound into one events type
// type EmitterEvents = ToastEvents & {
type EmitterEvents = {
	'signed-in': () => void;
};

export const bus = new EventEmitter() as TypedEmitter<EmitterEvents>;
