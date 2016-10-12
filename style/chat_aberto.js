
	var token = localStorage.getItem("aute_token");
	var aute_id = localStorage.getItem("aute_id");
	var PATH_API = localStorage.getItem("PATH_API");
	var NovaConversa = function() {
		this.comSala = 0;
		this.totalMensagens = 0;
		this.div = ".conversa";
		this.ultMsg = 0;

		this.Carrega = function(id_ult,local) {
			var url = PATH_API + "chat_conversa.php?token="+token+"&sala="+this.comSala+"&id_ult="+id_ult;
			$.ajax({
				url: url,
				context: this,
				success: function(data) {
					if (data.length) {
						var k = $.parseJSON(data);
						var total = k.length;
						for (var i=0; i<total; i++) {
							if (k[i].id_usuario == aute_id) {
					    	this.Escreve(k[i].mensagem,"eu",k[i].id,k[i].dia,k[i].hora,local,k[i].imagem);
					    } else {
					    	this.Escreve(k[i].mensagem,"ele",k[i].id,k[i].dia,k[i].hora,local,k[i].imagem);
					    }
					    this.ultMsg = k[i].id;
						}
						$(this.div).animate({ scrollTop: $(this.div)[0].scrollHeight }, 1000);
					}
				}
			});
			
		}

		this.Enviar = function(mensagem) {
			$.ajax({
				url: PATH_API + "chat_enviar_mensagem.php?token="+token+"&sala="+this.comSala+"&mensagem="+mensagem,
				context: this,
				success: function(data) {
					var k = $.parseJSON(data);
					if (k.status === "success") {
						this.Escreve(mensagem,"eu",k.id,k.dia,k.hora,"fim","");
						$(this.div).animate({ scrollTop: $(this.div)[0].scrollHeight }, 1000);
					} else {
						console.error('Erro!!!!!!');
					}
				}
			});

		}


		this.Escreve = function(mensagem,quem,id_msg,dia,hora,local,imagem) {
			var html = "<div class='item_msg' id='"+id_msg+"'>";
			if (quem === "eu") {
				var float = "right";
				html += "<div class='item_msg_eu'>"+mensagem+"</div>";
			} else {
				var float = "left";
				html += "<img src='"+imagem+"' class='item_msg_img'><div class='item_msg_para'>"+mensagem+"</div>";
			}
			html += "<div class='item_msg_hora' style='float: "+float+"'>"+dia+"<br>"+hora+"</div>";
			html += "</div>";
			if (local === "fim") {
				$(this.div).append(html);
			} else if (local === "inicio") {
				$(this.div).prepend(html);
			} else {
				$(this.div).html(html);
			}
		}


	}



