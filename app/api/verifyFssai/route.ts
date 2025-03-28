import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { fssai_license } = await request.json()

  try {
    const postResponse = await fetch("https://eve.idfy.com/v3/tasks/async/verify_with_source/ind_fssai", {
      method: "POST",
      headers: {
        "api-key": "1d8d1ed8-aa99-4dff-8e63-2118749ceaf7",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_id: "74f4c926-250c-43ca-9c53-453e87ceacd1",
        group_id: "8e16424a-58fc-4ba4-ab20-5bc8e7c3c41e",
        data: {
          registration_no: fssai_license,
        },
      }),
    })

    const postData = await postResponse.json()
    if (!postData.request_id) {
      return Response.json({ error: "Failed to verify FSSAI License." }, { status: 500 })
    }

    const request_id = postData.request_id
    let licenseStatus = null

    for (let i = 0; i < 5; i++) { // Retry max 5 times
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 2 seconds before checking
        
        const getResponse = await fetch(`https://eve.idfy.com/v3/tasks?request_id=${request_id}`, {
          method: "GET",
          headers: {
            "api-key": "1d8d1ed8-aa99-4dff-8e63-2118749ceaf7",
            "Content-Type": "application/json",
            "account-id": "232e0bb2e56d/5ab6cb0b-ad3c-4f5b-9ba9-85253ca9e1d2"
          }
        });

        const getData = await getResponse.json()
        if (getData.length === 0) continue; // No data yet, retry
        console.log(getData);
        const result = getData[0].result?.source_output
        if (!result) continue;
        console.log(result);
        licenseStatus = result.status

        if (licenseStatus === "id_found") {
        const companyDetails = result.company_details.validity === "Active" ? result.company_details : null
        return Response.json(companyDetails, { status: 200 })
        }
    }

    return Response.json(null, { status: 404 })
  } catch (error) {
    console.error("FSSAI Validation Error:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

