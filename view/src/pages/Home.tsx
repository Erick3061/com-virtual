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
        <div className="container container-fw container-fh">
            <div className="layout">


                <div className="card">
                    <div className="content">
                        <div className="card__title">
                            <div className="left">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/2392px-Nissan_logo.png" alt="" />
                                <span>Linear</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="card__info">
                            <h2>Basic information</h2>
                            <p>Path: <span>GTRGGSFAYSRTS</span> </p>
                            <p>Sender: <span>Servidor</span></p>
                            <p>Estado Sender: <span className="on">Active</span></p>
                        </div>
                    </div>

                    <div className="card__actions">
                        <span>View log</span>
                        <span>More...</span>
                    </div>
                </div>

                <div className="card">
                    <div className="content">
                        <div className="card__title">
                            <div className="left">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/2392px-Nissan_logo.png" alt="" />
                                <span>Linear</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="card__info">
                            <h2>Basic information</h2>
                            <p>Path: <span>GTRGGSFAYSRTS</span> </p>
                            <p>Sender: <span>N/A</span></p>
                            <p>Status Sender: <span className="not">Not implemented</span></p>
                        </div>
                    </div>

                    <div className="card__actions">
                        <span>View log</span>
                        <span>More...</span>
                    </div>
                </div>

                <div className="card">
                    <div className="content">
                        <div className="card__title">
                            <div className="left">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/2392px-Nissan_logo.png" alt="" />
                                <span>Linear</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="card__info">
                            <h2>Basic information</h2>
                            <p>Path: <span>GTRGGSFAYSRTS</span> </p>
                            <p>Sender: <span>Client</span></p>
                            <p>Status Sender: <span className="stop">Stop</span></p>
                        </div>
                    </div>

                    <div className="card__actions">
                        <span>View log</span>
                        <span>More...</span>
                    </div>
                </div>

                <div className="card">
                    <div className="content">
                        <div className="card__title">
                            <div className="left">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/2392px-Nissan_logo.png" alt="" />
                                <span>Linear</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="card__info">
                            <h2>Basic information</h2>
                            <p>Path: <span>GTRGGSFAYSRTS</span> </p>
                            <p>Sender: <span>Client</span></p>
                            <p>Status Sender: <span className="warning">Retry connection</span></p>
                        </div>
                    </div>

                    <div className="card__actions">
                        <span>View log</span>
                        <span>More...</span>
                    </div>
                </div>

            </div>


            <div className="float">
                <input type="checkbox" className="float__checkbox" id="navi-toggle" />

                <label htmlFor="navi-toggle" className="float__button">
                    <span className="float__icon">&nbsp;</span>
                </label>


                <div className="float__background">&nbsp;</div>

                <form action="" className="float__form">

                    <div className="float__list">

                        <div className="float__item">
                            <div className="form__container">
                                <input type="text" id="baud-rate" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="baud-rate">BaudRate:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="ack" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="ack">ACK:</label>
                            </div>
                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="path" placeholder=" ">
                                    <option value="1" disabled>1</option>
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                </select>
                                <label className='form__label-text' htmlFor="path">Path:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="attemp" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="attemp">Attemps:</label>
                            </div>
                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="data-bits" placeholder=" ">
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                </select>
                                <label className='form__label-text' htmlFor="data-bits">Data bits:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="attemp" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="attemp">Attemps:</label>
                            </div>
                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <input type="text" id="highWater-mark" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="highWater-mark">HighWaterMark:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="delimiter" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="delimiter">Delimiter:</label>
                            </div>
                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="parity" placeholder=" ">
                                    <option value="none">none</option>
                                    <option value="even">even</option>
                                    <option value="odd">odd</option>
                                    <option value="mark">mark</option>
                                    <option value="space">space</option>
                                </select>
                                <label className='form__label-text' htmlFor="parity">Data bits:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="heartbeat" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="heartbeat">Heartbeat:</label>
                            </div>

                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="rtscts" placeholder=" ">
                                    <option value="True">Si</option>
                                    <option value="False">No</option>
                                </select>
                                <label className='form__label-text' htmlFor="rtscts">rtscts:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="intervalAck" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="intervalAck">IntervalAck:</label>
                            </div>

                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="rts-mode" placeholder=" ">
                                    <option value="handshake">Handshake</option>
                                    <option value="enable">Enable</option>
                                    <option value="toggle">Toggle</option>
                                </select>
                                <label className='form__label-text' htmlFor="rts-mode">RtsMode:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="intervalAck" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="intervalAck">IntervalAck:</label>
                            </div>

                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="rtsMode" placeholder=" ">
                                    <option value="handshake">Handshake</option>
                                    <option value="enable">Enable</option>
                                    <option value="toggle">Toggle</option>
                                </select>
                                <label className='form__label-text' htmlFor="rtsMode">RtsMode:</label>
                            </div>

                            <div className="form__container">
                                <input type="text" id="intervalHeart" className="form__input-text" placeholder=" " />
                                <label className='form__label-text' htmlFor="intervalHeart">iItervalHeart:</label>
                            </div>

                        </div>

                        <div className="float__item">

                            <div className="form__container">
                                <select className="form__input-text" name="" id="stopBits" placeholder=" ">
                                    <option value="1">1</option>
                                    <option value="1.5">1.5</option>
                                    <option value="2">2</option>
                                </select>
                                <label className='form__label-text' htmlFor="stopBits">StopBits:</label>
                            </div>

                            <div className="form__container">
                                <button>Save</button>
                            </div>

                        </div>


                    </div>
                </form>

            </div>
        </div>
        // <div className='container-full'>
        //     <div className='dashboard' >
        //         <div className='left'>
        //             <h2>Receivers</h2>
        //             {isLoading ? <div>Loading</div> : data && data.map(r => <Receiver key={r.id} {...r} />)}
        //         </div>
        //         <div className='top'>
        //             {isFetching && <p>Refreshing</p>}
        //             <button>new</button>
        //             <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        //                 <p style={{ fontSize: 12 }}>Server Status</p>
        //                 <div style={state ? { ...circle, backgroundColor: 'green' } : { ...circle, backgroundColor: 'red' }} />
        //             </div>
        //         </div>
        //         <DescReciver />
        //     </div>

        // </div>
    )
}
