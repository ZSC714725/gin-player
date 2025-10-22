'use strict';

// Performs the actual SDP exchange.
async function negotiateConnectionWithClientOffer(peerConnection, endpoint, token) {
  const offer = await peerConnection.createOffer();
  console.debug(`whxp client offer sdp:\n%c${offer.sdp}`, 'color:cyan');
  await peerConnection.setLocalDescription(offer);
  while (peerConnection.connectionState !== 'closed') {
    let response = await postSDPOffer(endpoint, token, offer.sdp);
    if (response.status === 201) {
      let answerSDP = await response.text();
      console.debug(`whxp client answer sdp:\n%c${answerSDP}`, 'color:cyan');
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: answerSDP })
      );
      return response.headers.get('Location');
    } else if (response.status === 405) {
      console.error('Update the URL passed into the WHIP or WHEP client');
    } else {
      const errorMessage = await response.text();
      console.error(errorMessage);
    }

    await new Promise(r => setTimeout(r, 5000));
  }
}

async function postSDPOffer(endpoint, token, data) {
  console.log('Sending POST request to:', endpoint);
  console.log('Request headers:', {
    'Content-Type': 'application/sdp',
    'Authorization': 'Bearer ' + token,
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': 'Bearer ' + token,
      },
      body: data,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
