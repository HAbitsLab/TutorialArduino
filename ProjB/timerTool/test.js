//=================== Timer class ==============================
function CountDownTimer(duration, granularity) {
    this.duration = duration;
    this.granularity = granularity || 1000;
    this.tickFtns = [];
    this.running = false;
}

CountDownTimer.prototype.start = function() {
    if (this.running) {
        return;
    }
    this.running = true;

    if (this.hasOwnProperty("alarmTime")) {
        this.toggleAlarmOn = true;
    }

    var start = Date.now(),
        that = this,
        diff, obj,
        timeoutID;

    (function timer() {

        diff = that.duration - (((Date.now() - start) / 1000) | 0);

        if (diff > 0) {
            timeoutID = setTimeout(timer, that.granularity);
        } else {
            diff = 0;
            that.running = false;
        }

        if ((diff < that.alarmTime) && that.toggleAlarmOn) {
            that.toggleAlarmOn = false; // make sure that the alarm is called once;
            that.alarmFtn.call(this);
        }

        obj = CountDownTimer.parse(diff);
        that.tickFtns.forEach(function(ftn) {
            ftn.call(this, obj.minutes, obj.seconds);
        }, that);

        return timeoutID;
    }());

    var resetTimer = function() {
        if (that.running) {
            clearTimeout(timeoutID);
            that.running = false;
            that.duration = 0;
        }
    }
    return resetTimer;
};

CountDownTimer.prototype.onTick = function(ftn) {
    if (typeof ftn === 'function') {
        this.tickFtns.push(ftn);
    }
    return this;
};

CountDownTimer.prototype.onAlarm = function(ftn) {
    if (typeof ftn === 'function') {
        this.alarmFtn = ftn;
    }
    return this;
};

CountDownTimer.prototype.expired = function() {
    return !this.running;
};

CountDownTimer.prototype.setTime = function(secs) {
    this.duration = secs;
}

CountDownTimer.prototype.setAlarmTime = function(alarmTime) {
    this.alarmTime = alarmTime;
}

CountDownTimer.prototype.reset = function(timeoutID) {}

CountDownTimer.parse = function(seconds) {
    return {
        'minutes': (seconds / 60) | 0,
        'seconds': (seconds % 60) | 0
    };
};

// ===================================================================

var globalIndex = 0;
var timer;
var reset;

window.onload = function() {
    updateSelection(0);

    display = document.querySelector('#timer');

    globalIndex = 0;
    $('#ActionGuide').text(experiment[globalIndex].action);

    timer = new CountDownTimer(experiment[globalIndex].secs);
    timer.setAlarmTime(1);
    timer.onAlarm(playsound);
    reset = timer.onTick(format).start();

    console.log("Start experiment");
};

function updateSelection(newIndex) {
    globalIndex = newIndex;
    $('#ActionGuide').text(experiment[globalIndex].action);
    console.log(Date.now());
}

function format(minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    $('#timer').text(minutes + ':' + seconds);

    if (this.expired()) 
        restart();
}

function restart() {

    if (globalIndex < experiment.length - 1) {
        updateSelection(globalIndex + 1);
        timer.setTime(experiment[globalIndex].secs);
        reset = timer.start();
    } else {
        $('#button').show()
    }
    $('#timer').css('color', 'black')
}

function playsound() {
    var snd = new Audio('elevator.mp3');
    snd.play();

    if ((globalIndex < experiment.length - 1) && (globalIndex > 0)) {
        $('#timer').css('color', 'purple')
        // $('#ActionGuide').text('Prepare for the next action: ' + experiment[globalIndex + 1].action)
    } else if (globalIndex == experiment.length - 1){
        $('#ActionGuide').text('Please finish the remaining food, this is the last step of the experiment. Enjoy your meal!')
    }
}
