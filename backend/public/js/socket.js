//create a web socket connection
const socket = io();

socket.on('change', (data) => {
    console.log('change event received. Data: ', data);
    // alert(data.key + ' - '+ data.value);
    window.location.reload();
});
