export async function slack(request) {
    const { headers } = request
    const contentType = headers.get("content-type") || ""
    let slackJson = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ""
                }
            },
        ]
    }
    if (contentType.includes("application/json")) {
        let bodyy = JSON.stringify(await request.json())
        bodyy = JSON.parse(bodyy)
        let url = "https://app.squadcast.com/incident/" + bodyy.id
        let title = ""
        let serviceName = ""
        let alertSource = ""
        let text = ""

        if (bodyy.event_type == "incident_resolved") {
            title = "<" + url + "|*Resolved #" + bodyy.id + "*>\n"
        }
        else if (bodyy.event_type == "incident_reassigned") {
            title = "<" + url + "|*Reassigned #" + bodyy.id + "*>\n"
        }
        else if (bodyy.event_type == "incident_acknowledged") {
            title = "<" + url + "|*Acknowledged #" + bodyy.id + "*>\n"
        }
        else if (bodyy.event_type == "incident_triggered") {
            title = "<" + url + "|*Triggered #" + bodyy.id + "*>\n"
        }
        serviceName = bodyy.service.name
        alertSource = bodyy.alert_source.type
        let message = bodyy.message
        message = message.replace(/\n+/g, "")
        text = "\n-------------------------------------\n" + title + message + "\n*Description* \n" + bodyy.description + "\n*Service Name*:" + serviceName + "\n*Alert soure*: " + alertSource
        text = text.replace(/\n+/g, "\n")
        text = text.replace(/\*\*/g, "")
        slackJson.blocks[0].text.text = text
        let slackUrl = request.headers.get("slackurl")
        const init = {
            body: JSON.stringify(slackJson),
            method: "POST",
            headers: {
                "content-type": "application/json;charset=UTF-8",
            },
        }
        if (slackUrl != undefined) {
            slackUrl = slackUrl.split(",")
        }
        for (let url in slackUrl) {
            let temp_url = slackUrl[url].trim()
            if (temp_url.length > 0) {
                await fetch(temp_url, init)
            }
        }
        return slackJson
    }
    else {
        return 'a file';
    }
}