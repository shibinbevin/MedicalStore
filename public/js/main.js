document.getElementById("delete-medicine").addEventListener("click", (event)=>{
    axios.delete("http://localhost:8080/medicines/delete/" + event.target.getAttribute("dataid"))
    .then((response)=>{
        console.log(response);
        alert("deleting post");
        window.location = "/";
    })
    .catch(error=>console.log(error));
});