// functions as implemented in the jatos documentation (https://www.jatos.org/Session-Data-Three-Types.html)

function initBatchConditions() {
    // Initialize the conditions
    let conditions = ['JS', 'SJ'];

    // Check if 'conditions' are not already in the batch session
    if (!jatos.batchSession.defined("/condition")) {
        // Start with a random conditions
        let randomIndex = Math.floor(Math.random() * conditions.length);
        let randomCondition = conditions[randomIndex];
        jatos.batchSession.set("condition", randomCondition)
            .then(() => console.log("Batch session was initialized"))
            .catch(() => console.log("Batch session init failed"))
    } else if (jatos.batchSession.get("condition") === 'JS') {
        // Put the conditions in the batch session
        jatos.batchSession.replace("/condition", 'SJ')
            .then(() => console.log("Batch Session was successfully updated"))
            .catch(() => console.log("Batch Session synchronization failed"));
    } else if (jatos.batchSession.get("condition") === 'SJ') {
        jatos.batchSession.replace("/condition", 'JS')
            .then(() => console.log("Batch Session was successfully updated"))
            .catch(() => console.log("Batch Session synchronization failed"));
    }
}
