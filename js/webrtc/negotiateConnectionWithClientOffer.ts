'use strict';

// Performs the actual SDP exchange.
async function negotiateConnectionWithClientOffer(peerConnection: RTCPeerConnection, endpoint: string, token: string): Promise<string> {
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
      return response.headers.get('Location') || '';
    } else if (response.status === 405) {
      console.error('Update the URL passed into the WHIP or WHEP client');
    } else {
      const errorMessage = await response.text();
      console.error(errorMessage);
    }

    await new Promise(r => setTimeout(r, 5000));
  }
  return '';
}

async function postSDPOffer(endpoint: string, token: string, data: string): Promise<Response> {
  return await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/sdp',
      'Authorization': 'Bearer ' + token,
    },
    body: data,
  });
}
