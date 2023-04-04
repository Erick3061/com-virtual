export interface Sender {
    start: () => void;
    emit: (data: string) => void;
    waitAck: (interval: number) => void;

}