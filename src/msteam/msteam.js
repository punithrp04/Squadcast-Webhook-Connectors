addEventListener("fetch", event => {
	const { request } = event
	if (request.method === "POST") {
	  return event.respondWith(handleRequest(request))
	}
	else if (request.method === "GET") {
	  return event.respondWith(new Response(`The request was a GET`))
	}
  })

async function handleRequest(request) {
  let pathname = new URL(request.url).pathname
  let reqBody;
  if(pathname == "/msteam"){
    reqBody = await msTeam(request)
  }
  const retBody = `The request body sent in was ${JSON.stringify(reqBody)}`
  return new Response(retBody)
}

export async function msTeam(request) {
    const { headers } = request
    const contentType = headers.get("content-type") || ""
    let msTeamJSON = {
        "@context": "https://schema.org/extensions",
        "@type": "MessageCard",
        "themeColor": "0070C6",
        "title": "",
        "text": "",
        "potentialAction": [
            {
                "@type": "OpenUri",
                "name": "View incident",
                "targets": [
                    {
                        "os": "default",
                        "uri": ""
                    }
                ]
            }
        ]
    }
    if (contentType.includes("application/json")) {
        let bodyy = JSON.stringify(await request.json())
        bodyy = JSON.parse(bodyy)
        let title = ""
        let themeColor = ""
        let text = ""
        let serviceName = ""
        let alertSource = ""
        let url = ""
        if (bodyy.event_type == "incident_resolved") {
            title = "Resolved"
            themeColor = "16c26a"
        }
        else if (bodyy.event_type == "incident_reassigned") {
            title = "Reassigned"
            themeColor = "ab54ea"
        }
        else if (bodyy.event_type == "incident_acknowledged") {
            title = "Acknowledged"
            themeColor = "ecc40c"
        }
        else if (bodyy.event_type == "incident_triggered") {
            title = "Triggered"
            themeColor = "ab54ea"
        }
        serviceName = bodyy.service.name
        alertSource = bodyy.alert_source.type
        title = title + "\n\n" + bodyy.message
        text = "### Description \n\n" + bodyy.description + "\n\n**Service Name**:" + serviceName + "\n\n**Alert soure**: " + alertSource
        url = "https://app.squadcast.com/incident/" + bodyy.id
        msTeamJSON.title = title
        msTeamJSON.text = text
        msTeamJSON.themeColor = themeColor
        msTeamJSON.potentialAction[0].targets[0].uri = url
        let msteamUrl = headers.get("msteamurl")
        const init = {
            body: JSON.stringify(msTeamJSON),
            method: "POST",
            headers: {
              "content-type": "application/json;charset=UTF-8",
            },
        }
        if (msteamUrl != undefined) {
            msteamUrl = msteamUrl.split(",")
        }
        else{
            return "msteamurl not found in header"
        }
        for (let url in msteamUrl) {
            let temp_url = msteamUrl[url].trim()
            if (temp_url.length > 0) {
                await fetch(temp_url, init)
            }
        }
        return msTeamJSON
    }
    else {
        return 'a file';
    }
}