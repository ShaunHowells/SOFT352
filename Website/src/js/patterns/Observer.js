/**
 * @classdesc Implementation of the Observer pattern
 * Used to allow classes to observe the actions of other classes
 * 
 * @class
 */
function Observer() { // eslint-disable-line no-unused-vars
    this.observers = [];

    /**
     * Add a new method to observers
     * 
     * @param {function} fn - The function to add as an observer
     * @memberof Observer
     */
    this.subscribe = function (fn) {
        this.observers.push(fn);
    };

    /**
     * Remove a method from observers
     * 
     * @param {function} fn-  The function to remove as an observer
     */
    this.unsubscribe = function (fn) {
        this.observers = this.observers.filter(function (value) {
            return value !== fn;
        });
    };


    /**
     * Call every observer
     * 
     * @param {object} data - The data to pass into the each observer 
     * @memberof Observer
     */
    this.notify = function (data) {
        this.observers.forEach(function (fn) {
            fn(data);
        });
    };
}