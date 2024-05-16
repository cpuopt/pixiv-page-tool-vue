const addLog = (logObj, msg) => {
    logObj.push(msg);
    setTimeout(() => {
        document.querySelector('#msg_end').scrollIntoView();
    }, 100);
};

export {addLog}