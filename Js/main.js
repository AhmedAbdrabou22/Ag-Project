let progresDiv = document.querySelector(".progress-div");
let progresBar = document.querySelectorAll(".progress-bar");
let conterDiv = document.querySelector(".counter-div ");
let conterCounter = document.querySelectorAll(".counter-div h3") 

//احنا هنا هنحط القيم اللي حطناها في aria-valuenow="" in bootstrab in html هنحطها كاwidth
ScrollOut({
    targets:".progress-div , .counter-div "
});
window.addEventListener("scroll",()=>{
    //Js of progress section
    if(progresDiv.dataset.scroll == "in"){
        progresBar.forEach(el=>{
            let valuearea = el.getAttribute("aria-valuenow");
            el.style.width=valuearea + "%";
            let spanconuter =el.parentElement.parentElement.querySelector(".progres-value span");
            let timer = setInterval(() => {
                if(Number(spanconuter.textContent) < valuearea){
                    spanconuter.textContent = Number(spanconuter.textContent) + 1 ;
                }
                else{
                    clearInterval(timer)
                }
            }, 400);
        })
    }else{
        progresBar.forEach(elw=>{
            elw.style.width=0 + "%";
            elw.parentElement.parentElement.querySelector(".progres-value span").textContent = 0;
        })
    }

    /** Js of Section Counter*/

    //Counter
    if(conterDiv.dataset.scroll == "in"){
        conterCounter.forEach(el=>{
            let time = setInterval(() => {
                if(Number(el.innerHTML) < el.dataset.counter){
                    el.innerHTML = Number(el.innerHTML) +1 ;
                }else{
                    clearInterval(time);
                }
            },600);
        })
    }else{
        conterCounter.forEach(el=>{
            el.innerHTML = 0;
        })
    }

})

/* protflio*/ 

let listGroubItems = document.querySelectorAll(".list-group li");
let filterItems = document.querySelectorAll(".filter-item a");

listGroubItems.forEach(list=>{
    list.addEventListener("click",()=>{
        document.querySelector(".list-group li.active").classList.remove("active")
        list.classList.add("active")
        let dataFilter = list.dataset.filter;
        filterItems.forEach(item=>{
            if(item.classList.contains(dataFilter)){
                item.classList.remove("hidden");
                item.classList.add("active");
            }else{
                item.classList.remove("active");
                item.classList.add("hidden");
            }
        })
    })
})

// Gallery in protflio
lightGallery(document.getElementById('ligtGallery'), {
});




AOS.init();

let one = document.querySelector(".one")
let two = document.querySelector(".two")
console.log(one)
window.onload = function(){
    one.focus();
}
one.onblur = function(){
    two.focus();
}