/**
 * Created by Finley.Feng on 2015/1/7
 */
'use strict';
var cluster = require('cluster');
var os = require('os');

// Get number of CPUs
var numCPUs = os.cpus().length;

var workers = {};
if (cluster.isMaster) {
    // ------------------- main process branch -------------------

    // when the process dead, restart the process
    cluster.on('death', function (worker) {
        delete workers[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });
    // when the process exit, restart the process
    cluster.on('exit', function (err) {
        if(err){
            console.log(JSON.stringify(err));
        }
        delete workers[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });
    // Initialize same number of process as the number of CPUs
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        workers[worker.pid] = worker;
    }
} else {
    // ------------------- work process branch -------------------
    require('./app');
}

// Shutdown all the process when the main process terminated
process.on('SIGTERM', function () {
    for (var pid in workers) {
        process.kill(pid);
    }
    process.exit(0);
});

process.on('uncaughtException', function (err) {
    console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
});
