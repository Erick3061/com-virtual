import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DescReciver, Receiver } from '../components/Receiver';
import { useQuery } from '@tanstack/react-query';
import { getReceivers } from '../api/Request';

export const Home = () => {
    const { state, receiver } = useContext(AppContext);
    const { data, error, isLoading, isFetching } = useQuery({ queryKey: ['receiver'], queryFn: getReceivers });

    const circle: React.CSSProperties = {
        width: '1.2rem',
        height: '1.2rem',
        borderRadius: '1rem',
        margin: '.3rem',
    }

    return (
        <div className='container-full'>
            <div className='dashboard' >
                <div className='left'>
                    <h2>Receivers</h2>
                    {isLoading ? <div>Loading</div> : data && data.map(r => <Receiver key={r.id} {...r} />)}
                </div>
                <div className='top'>
                    {isFetching && <p>Refreshing</p>}
                    <button>new</button>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <p style={{ fontSize: 12 }}>Server Status</p>
                        <div style={state ? { ...circle, backgroundColor: 'green' } : { ...circle, backgroundColor: 'red' }} />
                    </div>
                </div>
                <DescReciver />
            </div>

        </div>
    )
}
