function Observer(){
    this.observers = [];

    this.subscribe = function(fn){
        this.observers.push(fn);
    }

    this.unsubscribe = function(fn){
        this.observers = this.observers.filter(function(value){
            value !== fn
        });
    }

    this.notify = function(data){
        this.observers.forEach(function(fn){
            fn(data);
        });
    }
}