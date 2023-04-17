import React, { ReactElement, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { COM, ReceiverPost } from '../interfaces/interfaces';
import { useMutation } from '@tanstack/react-query';
import { newReceiver } from '../api/Request';
import { AxiosError, AxiosResponse } from 'axios';

type FormPostReceiver = COM & ReceiverPost;
type FormPostSender = { ip?: string, port: number };

export const FormAddReceiver = () => {
    const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormPostReceiver>();
    const mutation = useMutation({
        mutationKey: ['createReceiver'],
        mutationFn: newReceiver,
        onError: err => {
            const error = err as AxiosError;
            console.log(error.response);
        },
        onSuccess: (data) => {
            console.log(data);
        },
    });

    const onSubmit = handleSubmit(data => {
        const { delimiter, attempt, intervalAck, intervalHeart, heartbeat, ack, ...com } = data;

        mutation.mutate({
            com: {
                ...com,
                baudRate: +com.baudRate,
                highWaterMark: com.highWaterMark && +com.highWaterMark || undefined,
                stopBits: +stopBits,
            },
            delimiter,
            attempt: +attempt,
            intervalAck: +intervalAck,
            intervalHeart: +intervalHeart,
            heartbeat,
            ack,
        })
    });

    const path: Array<string> = ['path 1', 'path 2', 'path 3', 'path 4', 'path 5', 'path 6'];
    const dataBits: Array<number> = [5, 6, 7, 8];
    const parity: Array<string> = ["none", "even", "odd", "mark", "space"];
    const rtsMode: Array<string> = ["handshake", "enable", "toggle"];
    const stopBits: Array<number> = [1, 2, 1.5];

    return (
        <form className='container_form' onSubmit={onSubmit}>
            <div className='display'>
                <div>

                    <select {...register('path', { required: true })}>{path.map((op) => <option key={op} value={op}>{op}</option>)}</select>
                    <input
                        {...register('baudRate', { required: true, min: 0 })}
                        placeholder='baudRate'
                        type='number'
                    />
                    <select {...register('dataBits', { required: false })}>{dataBits.map((op) => <option key={op} value={op}>{op}</option>)}</select>
                    <input
                        {...register('highWaterMark', { required: false, min: 0 })}
                        placeholder='highWaterMark'
                        type='number'
                    />
                    <select {...register('parity', { required: false })}>{parity.map((op) => <option key={op} value={op}>{op}</option>)}</select>
                    <input {...register('rtscts')} type='checkbox' />
                    <select {...register('rtsMode', { required: false })}>{rtsMode.map((op) => <option key={op} value={op}>{op}</option>)}</select>
                    <select {...register('stopBits', { required: false })}>{stopBits.map((op) => <option key={op} value={op}>{op}</option>)}</select>
                </div>
                <div>
                    <input
                        {...register('delimiter', { required: false })}
                        placeholder='delimiter'
                        type='text'
                    />
                    <input
                        {...register('attempt', { required: false, min: 0 })}
                        placeholder='attempt'
                        type='number'
                    />
                    <input
                        {...register('intervalAck', { required: false, min: 0 })}
                        placeholder='intervalAck'
                        type='number'
                    />
                    <input
                        {...register('intervalHeart', { required: false, min: 0 })}
                        placeholder='intervalHeart'
                        type='number'
                    />
                    <input
                        {...register('heartbeat', { required: false })}
                        placeholder='heartbeat'
                        type='text'
                    />
                    <input
                        {...register('ack', { required: false })}
                        placeholder='ack'
                        type='text'
                    />
                </div>
            </div>
            <button type="submit">send</button>
        </form>
    )
}


type Sender = 'Server' | 'Client';
export const FormAddSender = ({ id = 'devttyUSB0' }: { id: string }) => {
    const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormPostSender>();
    const onSubmit = handleSubmit(data => {
        const { ip, port } = data;
    });

    const [typeSender, setTypeSender] = useState<Sender>('Server');

    return (
        <form onSubmit={onSubmit}>
            <p>Add Sender for Receiver with id: {id}</p>

            <select value={typeSender} onChange={event => {
                const value = event.target.value as Sender;
                setTypeSender(value);
            }}>
                <option value='Server'>Server</option>
                <option value='Client'>Client</option>
            </select>
            <input
                {...register('ip', { required: false })}
                placeholder='domain or ip'
                type='text'
                disabled={typeSender === 'Server'}
            />
            <input
                {...register('port', { required: true, min: 0 })}
                placeholder='port'
                type='number'
            />
            <button type="submit">send</button>
        </form>
    )
}