var modal = document.getElementById("myModal");
		// Get the button that opens the modal
		var btn = document.getElementById("myBtn");
		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];
		// When the user clicks on the button, open the modal
		var comment_input = document.getElementById('comment-input');
		var note_input = document.getElementById('note-place');
		var name_input = document.getElementById('name-input');


		function openModal(id_place) {
            const list_itens_div = document.getElementById("list-itens-comment");
            list_itens_div.innerHTML = '';
            axios.get("/api/places/data/"+id_place).then((res)=>{
            place_data = res.data;
            createListComments(id_place);
		    document.getElementById('place-modal').textContent = place_data.name;            
            modal.style.display = "block";

            })
		}

        
	 
        function createListComments(id){
            try {
			 axios.get("/api/comments/read/" + id).then((res) => {	
                const list_itens_div = document.getElementById("list-itens-comment");
                list_itens_div.innerHTML = '';
				list_comments = res.data;
				list_comments.forEach((comment) => {
					list_itens_div.insertAdjacentHTML('beforeend',
						"<div class='comment-item'>" +
						"<div class='row-comment-item'>" +
						"<span class='explore-rating' style = 'background:"+getColorCodeByNote(comment.note)+";'>" + comment.note + "</span>" +
						"<div class='column'>" +
						"<p>"+comment.name+"</p>" +
						"<p>" + comment.comment_text + "</p>" +
						"</div>" +
						"</div>" +
						"</div>"
					)

				})
			})
            }
		catch(e){
            console.log(e)
        }
		}

		function getColorCodeByNote(note){
          return note >= 3 &&  note < 4?"#70a9ff" : note >= 4 ? "#00c61c" : "#ff7a40";
		}

		function createListPlaces(){
            axios.get("/api/places/list").then((res) => {
			const div_places = document.getElementById("div-places"); 
			const places_list = res.data;
			places_list.forEach((place, index) => {
				div_places.insertAdjacentHTML('beforeend', "<div class='col-md-4 col-sm-6'>"+	
						"<div class='single-explore-item'>"+
							"<div class='single-explore-img'>"+
						"<img src= 'http://localhost:3000/api/midia/"+ place.image+ "'alt='explore image'/>"+
							"</div>"+
							"<div class='single-explore-txt bg-theme-2'>"+
                            "<h2><a href='#'>"+place.name+"</a></h2>"+
                            "<p class='explore-rating-price'>"+
                                    "<span id='notes_"+place.id+"'class='explore-rating notes'>5</span>"+
									"<a id='comments_"+place.id+"' class='number_comments' href='#'> 0 avaliações</a>" +
								"</p>" +
								"<div class='explore-open-close-part'>"+
									"<div class='row row-explore-icons'>"+
                                "<div class='btn-comment-explore-item' id='myBtn' onclick='openModal("+place.id+")'>"+
										"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-chat' viewBox='0 0 16 16'>"+
												"<path d='M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894m-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z'/>"+
											"</svg>"+"<label>comentários</label>"+
										"</div></div></div></div></div></div>"
										)                  
										 index+1 == places_list.length? updateNotes() : null; 
			              })
		      })
		}
		createListPlaces();
		function updateNotes(){
            axios.get("/api/places/statistics").then((res) => {
			places_data = res.data;
			places_data.forEach((place) => {
				const note = document.getElementById('notes_'+place.id_place);
				const comments = document.getElementById('comments_'+place.id_place);
			 if(note && comments){
				note.textContent = place.average_note;
				note.style.background = getColorCodeByNote(place.average_note)
				comments.textContent = place.number_comments + " Avaliações";
			   }
			})
		})
		}
		//atualiza de inicio com get depois chama socketio e atualiza realtime
		//puxar dados dos locais, e gerar lista, depois chamar update no then quando lista tiver criada

		const socket = io();
      socket.on('news', function (data) {
        updateNotes();
	   id_place != 0 ? createListComments(id_place):null;
	});

		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			closeModal();
		}

		function closeModal() {
			cleanInput()
            
			modal.style.display = "none";
		}

		function cleanInput() {
			note_input.value = "";
			comment_input.value = "";
			name_input.value = "";
		}

		document.getElementById("btn-send-comment").onclick = function () {
			var comment_text = comment_input.value;
			var note_place = note_input.value;
			var name = name_input.value;
			var data = { id_place: id_place, name: name, text: comment_text, note: note_place };

			axios.post('/api/comments/add', data)
				.then(function (response) {
					cleanInput();
					socket.emit("new_post",".")
				})
		}
		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function (event) {
			if (event.target == modal) {
				modal.style.display = "none";
			}
		}
		$(document).ready(function ($) {
			$('.onlynumbers').mask('#.00');
		})

		$(function () {
			$("input[name='onlynumbers']").on('input', function (e) {
				var number = Number.parseFloat($(this).val()).toFixed(2);
				$(this).val(number > 5 ? "" : $(this).val());
			});
		});