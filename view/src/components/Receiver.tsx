import React, { useContext, useState } from 'react';
import { ResponseReceiver } from '../interfaces/interfaces';
import { AppContext } from '../context/AppContext';
import { FormAddReceiver, FormAddSender } from './Form';


export const Receiver = (rv: ResponseReceiver) => {
    const { state, socket, updatereceiver } = useContext(AppContext);

    const [receiver, setReceiver] = useState(rv);

    socket.on(`status-devttyUSB0`, (resp) => {
        setReceiver(r => ({ ...r, status: Math.random() }));
    });

    return (
        <div
            className='receiver'
            onClick={() => updatereceiver(rv)}
        >
            <p>id: {receiver.id}</p>
            <p>status: {receiver.status}</p>
        </div>
    )
}

export const DescReciver = () => {
    const { receiver, socket } = useContext(AppContext);
    const [events, setEvents] = useState<Array<string>>([]);

    receiver && socket.on(`event-${receiver.id}`, (event) => setEvents([event, ...events].slice(0, 200)));

    return (
        <div className='main'>
            {/* <FormAddReceiver /> */}
            <FormAddSender id='1010101' />
            {/* <div className='primaryData'>
                {receiver ? <div>{JSON.stringify(receiver, null, 3)}</div> : null}
            </div>
            <div className='events'>
                <h4>Events</h4>
                {
                    events.map((ev, idx) => <p key={idx}>{ev}</p>)
                }
            </div> */}
        </div>
    )
}
