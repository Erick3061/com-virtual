import React, { ReactElement } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { COM, ReceiverPost } from '../interfaces/interfaces';
import { Input } from './Input';

type FormPost = COM & ReceiverPost;

export const FormAddReceiver = () => {
    const { control, register, setValue, handleSubmit, formState: { errors } } = useForm<FormPost>();
    const onSubmit = handleSubmit(data => console.log(data));

    return (
        <form className='container_form' onSubmit={onSubmit}>
            <div className='display'>
                <div>
                    <select {...register("path", { required: true })}>
                        <option value="path1">¨Path 1</option>
                        <option value="path2">¨Path 2</option>
                        <option value="path3">¨Path 3</option>
                    </select>
                    <Input control={control} rules={{ required: true }} formInputs={control._defaultValues} {...register('baudRate')} />
                    <Input control={control} rules={{ required: true }} formInputs={control._defaultValues} {...register('dataBits')} />
                    <Input control={control} rules={{ required: true }} formInputs={control._defaultValues} {...register('highWaterMark')} />
                    <div>
                        <label>ñslsls</label>
                        <input type='checkbox' />
                    </div>
                    <Input control={control} rules={{ required: true }} formInputs={control._defaultValues} {...register('rtsMode')} />
                    <Input control={control} rules={{ required: true }} formInputs={control._defaultValues} {...register('stopBits')} />
                </div>
                <div>
                    <Input control={control} rules={{ required: false }} formInputs={control._defaultValues} {...register('delimiter')} />
                    <Input control={control} rules={{ required: false }} formInputs={control._defaultValues} {...register('attempt')} />
                    <Input control={control} rules={{ required: false }} formInputs={control._defaultValues} {...register('intervalAck')} />
                    <Input control={control} rules={{ required: false }} formInputs={control._defaultValues} {...register('intervalHeart')} />
                    <Input control={control} rules={{ required: false }} formInputs={control._defaultValues} {...register('heartbeat')} />
                </div>
            </div>
            <button type="submit">send</button>
        </form>
    )
}