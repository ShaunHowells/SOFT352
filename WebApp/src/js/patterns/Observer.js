/**
 * @classdesc Implementation of the Observer pattern
 * Used to allow classes to observe the actions of other classes
 */
function Observer() {
    this.observers = [];

    /**
     * Add a new method to observers
     * 
     * @param {Function} fn The function to add as an observer
     * @memberof Observer
     */
    this.subscribe = function (fn) {
        this.observers.push(fn);
    }

    /**
     * Remove a method from observers
     * 
     * @param {Function} fn The function to remove as an observer
     */
    this.unsubscribe = function (fn) {
        this.observers = this.observers.filter(function (value) {
            value !== fn
        });
    }


    /**
     * Call every observer
     * 
     * @param data The data to pass into the each observer 
     * @memberof Observer
     */
    this.notify = function (data) {
        this.observers.forEach(function (fn) {
            fn(data);
        });
    }
}