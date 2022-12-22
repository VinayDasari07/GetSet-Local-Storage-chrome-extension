;(() => {
    async function getActiveTabURL() {
        try {
            const tabs = await chrome.tabs.query({
                currentWindow: true,
                active: true,
            })
            return tabs[0]
        } catch (err) {
            console.error('Error occured in getActiveTabURL', err)
        }
    }

    try {
        const session = 'session'
        const local = 'local'

        const getLocalStorageBtn = document.querySelector('#getLS')
        const setLocalStorageBtn = document.querySelector('#setLS')
        const clearLocalStorageBtn = document.querySelector('#clearLS')
        const feedBackForLocalStorage = document.querySelector('#feedbackLS')

        const getSessionStorageBtn = document.querySelector('#getSS')
        const setSessionStorageBtn = document.querySelector('#setSS')
        const clearSessionStorageBtn = document.querySelector('#clearSS')
        const feedBackForSessionStorage = document.querySelector('#feedbackSS')

        const information = document.querySelector('.information')

        /*
        <-----------Util Functions Start------------------------------------------------------>
        */

        // Get all the storage values from the domain to store it in extension's LS
        function getDomainStorageData(typeOfStorage = 'local') {
            try {
                const selectedStorage =
                    typeOfStorage === 'local' ? localStorage : sessionStorage
                const values = []
                if (selectedStorage) {
                    for (let i = 0; i < selectedStorage?.length; i++) {
                        const key = selectedStorage.key(i)
                        const selectedStorageObject = {
                            [key]: selectedStorage.getItem(key),
                        }
                        values.push(selectedStorageObject)
                    }
                }
                console.log(
                    'getDomainStorageData-typeOfStorage-values',
                    typeOfStorage,
                    values?.length || 0
                )
                return values
            } catch (err) {
                console.error(
                    'Error occured in getDomainStorageData',
                    typeOfStorage,
                    err
                )
            }
        }

        // Set all the storage values from the extension's LS to the domain's storage
        function setDomainStorageData(typeOfStorage = 'local') {
            try {
                const selectedStorage =
                    typeOfStorage === 'local' ? localStorage : sessionStorage
                if (selectedStorage) {
                    chrome.storage.local.get(typeOfStorage, function (items) {
                        if (items[typeOfStorage]) {
                            for (const storage of items[typeOfStorage]) {
                                const objKey = Object.keys(storage)
                                selectedStorage.setItem(
                                    objKey[0],
                                    storage[objKey]
                                )
                            }
                        }
                    })
                }
            } catch (err) {
                console.error(
                    'Error occured in setDomainStorageData',
                    typeOfStorage,
                    err
                )
            }
        }

        function clearDomainStorageData(typeOfStorage = 'local') {
            const selectedStorage =
                typeOfStorage === 'local' ? localStorage : sessionStorage
            selectedStorage && selectedStorage?.clear()
        }

        function clearExtensionStorage(typeOfStorage = 'local') {
            chrome.storage.local.remove([typeOfStorage], function () {
                const error = chrome.runtime.lastError
                if (error) {
                    console.error(error)
                }
                console.log(
                    'Cleared Existing Chrome Extension Storage!!',
                    typeOfStorage
                )
            })
        }

        function changeFooterTabStyles(target) {
            let infoTitle = document.querySelector('#infoTitle')
            let supportTitle = document.querySelector('#supportTitle')
            let reportTitle = document.querySelector('#reportTitle')
            const allTabs = [infoTitle, supportTitle, reportTitle]
            allTabs.forEach((tab) => {
                if (tab?.id === target) {
                    tab.style.borderBottom = '3px solid black'
                    tab.style.fontWeight = 'bold'
                } else {
                    tab.style.borderBottom = '0px'
                    tab.style.fontWeight = 'normal'
                }
            })
        }

        function showHideFooterTabs(target) {
            let moreinfoContent = document.querySelector('.moreinfoContent')
            let supportContent = document.querySelector('.supportContent')
            let reportContent = document.querySelector('.reportContent')
            const allTabsContent = [
                moreinfoContent,
                supportContent,
                reportContent,
            ]
            allTabsContent.forEach((tab) => {
                console.log(tab.className, 'className')
                if (tab?.className === target) {
                    tab.style.display = 'block'
                } else {
                    tab.style.display = 'none'
                }
            })
        }

        /*
        <-----------Util Functions End------------------------------------------------------>
        */

        /*
        <-----------Event Listeners Start------------------------------------------------------>
        */
        getLocalStorageBtn?.addEventListener('click', async () => {
            const activeTab = await getActiveTabURL()
            const tabId = activeTab?.id
            clearExtensionStorage(local)
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: getDomainStorageData,
                    args: [local], // passing typeOfStorage to getDomainStorageData func
                },
                (injectionResults) => {
                    try {
                        console.log(
                            'injectionResults of getLocalStorageBtn.addEventListener',
                            injectionResults[0]?.result?.length ?? 0
                        )
                        for (const frameResult of injectionResults) {
                            const result = frameResult?.result || []
                            chrome.storage.local.set({
                                local: result,
                            })
                            feedBackForLocalStorage.innerHTML =
                                'All the local storage values are retrieved.'
                        }
                    } catch (err) {
                        console.error(
                            'Error occured in injectionResults of getLocalStorageBtn.addEventListener',
                            err
                        )
                    }
                }
            )
        })

        getSessionStorageBtn?.addEventListener('click', async () => {
            const activeTab = await getActiveTabURL()
            const tabId = activeTab?.id
            clearExtensionStorage(session)
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: getDomainStorageData,
                    args: [session], // passing typeOfStorage to getDomainStorageData func
                },
                (injectionResults) => {
                    try {
                        console.log(
                            'injectionResults of getSessionStorageBtn.addEventListener',
                            injectionResults[0]?.result?.length ?? 0
                        )
                        for (const frameResult of injectionResults) {
                            const result = frameResult?.result || []
                            chrome.storage.local.set({
                                session: result,
                            })
                            feedBackForSessionStorage.innerHTML =
                                'All the session storage values are retrieved.'
                        }
                    } catch (err) {
                        console.error(
                            'Error occured in injectionResults of getSessionStorageBtn.addEventListener',
                            err
                        )
                    }
                }
            )
        })

        setLocalStorageBtn?.addEventListener('click', async () => {
            const activeTab = await getActiveTabURL()
            console.log('This tab information', activeTab)
            const tabId = activeTab?.id
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: setDomainStorageData,
                    args: [local], // passing typeOfStorage to setDomainStorageData func
                },
                () => {
                    try {
                        console.log('Setting LocalStorage successfull')
                        feedBackForLocalStorage.innerHTML =
                            'All the retrieved local storage values are set.'
                    } catch (err) {
                        console.error(
                            'Error occured in injectionResults of setStoragehandler',
                            err
                        )
                    }
                }
            )
        })

        setSessionStorageBtn?.addEventListener('click', async () => {
            const activeTab = await getActiveTabURL()
            console.log('This tab information', activeTab)
            const tabId = activeTab?.id
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: setDomainStorageData,
                    args: [session], // passing typeOfStorage to setDomainStorageData func
                },
                () => {
                    try {
                        console.log('Setting SessionStorage Successfull')
                        feedBackForSessionStorage.innerHTML =
                            'All the retrieved session storage values are set.'
                    } catch (err) {
                        console.error(
                            'Error occured in injectionResults of setStoragehandler',
                            err
                        )
                    }
                }
            )
        })

        clearLocalStorageBtn?.addEventListener('click', async () => {
            const activeTab = await getActiveTabURL()
            console.log('This tab information', activeTab)
            const tabId = activeTab?.id
            const tabURL = activeTab?.url || ''
            let domain
            if (tabURL) {
                domain = new URL(tabURL)
            }
            const text = `You're about to clear all the local storage values of ${
                domain?.hostname || 'this domain'
            }. Click OK to confirm or Cancel to go back`
            if (confirm(text) == true) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabId },
                        func: clearDomainStorageData,
                        args: [local], // passing typeOfStorage to clearDomainStorageData func
                    },
                    () => {
                        try {
                            console.log(
                                'Clearing Local Storage Values Successfull'
                            )
                            feedBackForLocalStorage.innerHTML =
                                'All the local storage values are cleared.'
                        } catch (err) {
                            console.error(
                                'Error occured in injectionResults of clearLocalStorageBtn',
                                err
                            )
                        }
                    }
                )
            } else {
            }
        })

        clearSessionStorageBtn?.addEventListener('click', async () => {
            const activeTab = await getActiveTabURL()
            console.log('This tab information', activeTab)
            const tabId = activeTab?.id
            const tabURL = activeTab?.url || ''
            let domain
            if (tabURL) {
                domain = new URL(tabURL)
            }
            const text = `You're about to clear all the session storage values of ${
                domain?.hostname || 'this domain'
            }. Click OK to confirm or Cancel to go back`
            if (confirm(text) == true) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabId },
                        func: clearDomainStorageData,
                        args: [session], // passing typeOfStorage to clearDomainStorageData func
                    },
                    () => {
                        try {
                            console.log(
                                'Clearing Session Storage Values Successfull'
                            )
                            feedBackForSessionStorage.innerHTML =
                                'All the session storage values are cleared.'
                        } catch (err) {
                            console.error(
                                'Error occured in injectionResults of clearSessionStorageBtn',
                                err
                            )
                        }
                    }
                )
            }
        })

        information.addEventListener('click', (event) => {
            if (event?.target?.id === 'infoTitle') {
                changeFooterTabStyles(event?.target?.id)
                showHideFooterTabs('moreinfoContent')
            } else if (event?.target?.id === 'supportTitle') {
                changeFooterTabStyles(event?.target?.id)
                showHideFooterTabs('supportContent')
            } else if (event?.target?.id === 'reportTitle') {
                changeFooterTabStyles(event?.target?.id)
                showHideFooterTabs('reportContent')
            }
        })

        /*
        <-----------Event Listeners End------------------------------------------------------>
        */
    } catch (err) {
        console.error('Error occured in global popup.js', err)
    }
})()
