async function getActiveTabURL() {
    try {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        });
        return tabs[0];
    } catch (err) {
        console.error("Error occured in getActiveTabURL", err)
    }
}

try {
    const getButton = document.querySelector('#get');
    const feedBack = document.querySelector('#feedback');
    const setButton = document.querySelector('#set');
    
    async function getLocalStorageData () {
        try {
            const values = []
            for (let i = 0; i < localStorage?.length; i++) {
                const key = localStorage.key(i)
                const localStorageObject = {
                    [key]: localStorage.getItem(localStorage.key(i))
                }
                values.push(localStorageObject)
              }
            return values
        } catch (err) {
            console.error("Error occured in getLocalStorageData", err)
        }
        
    }

    getButton.addEventListener("click", async() => {
        const activeTab = await getActiveTabURL();
        console.log("This tab information", activeTab)
        const tabId = activeTab?.id
        chrome.storage.local.clear(function() {
            const error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
           console.log("Cleared Existing Chrome Extension Storage!!")
        });
        chrome.scripting.executeScript(
        {
            target: {tabId: tabId},
            func: getLocalStorageData,
        },
        (injectionResults) => {
            try {
                console.log("injectionResults of getButton.addEventListener", injectionResults)
                for (const frameResult of injectionResults) {
                    const result = frameResult?.result || []
                    chrome.storage.local.set({
                        'getSet': result
                    });
                    feedBack.innerHTML = "All the local storage values are retrieved."
                }
            } catch (err) {
                console.error("Error occured in injectionResults of getButton.addEventListener", err)
            }
            
                
        });
    })
    
    async function setLocalStorageData () {
        try {
            chrome.storage.local.get('getSet', function(items) {
                console.log('getSet co', items?.getSet)
                for (const storage of items['getSet']) {
                    const objKey = Object.keys(storage)
                    console.log("test storage ", objKey, storage[objKey]);
                    localStorage.setItem(objKey[0], storage[objKey])
                }
            }); 
        } catch (err) {
            console.error("Error occured in setLocalStorageData", err)
        }
         
    }
    
    setButton.addEventListener('click', async() => {
        const activeTab = await getActiveTabURL();
        console.log("This tab information", activeTab)
        const tabId = activeTab?.id
        chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: setLocalStorageData,
        },
        () => {
            try {
                feedBack.innerHTML = "All the retrieved local storage values are set."
            } catch (err) {
                console.error("Error occured in injectionResults of setButton.addEventListener", err)
            }
        });
        
    })
} catch (err) {
    console.error("Error occured in global popup.js", err)
}

