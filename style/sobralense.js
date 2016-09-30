/* global PATH_API */
localStorage.setItem("PATH_API","http://www.sobralense.com.br/api/");
//localStorage.setItem("PATH_API","http://localhost/sobralense/api/");
var PATH_API = localStorage.getItem("PATH_API");


$(function(){
	VerificaAuth();
  $(document).on('ready', function() {
    Waves.init();
    Waves.attach('footer a, .waves',null);
  });
  
  $("section.pagina").hide();
  
  $("section#inicio").load("./pages/inicio.html",function() {
    $(this).show();
    $("#info_geral").attr("data-pagina-atual","inicio");
    $("footer [data-src=inicio]").addClass("active");
    $("section#inicio").attr("data-load","s");
    $("#box_postar_img_perfil").attr("src",localStorage.getItem("aute_img_perfil"));
    $("#hide_usuario").val(localStorage.getItem("aute_id"));
    Timeline(0);
  });
  
  $(window).scroll(function() {
	  if ($(window).scrollTop() === $(document).height() - $(window).height()) {
	  	var page = $("#hide_pagina").val();
	  	if (page === "inicio" || page === "perfil") {
		    Timeline("");
		  }
		  if (page === "explorar") {
		    Explorar("");
		  }
	  }
	});

  $("header").swipe({
    swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection) {
      if (direction === "down") {
        if (distance > 150) var dis = 150;
        else var dis = distance;
        $(".atualiza_section").css("top",(-150 + dis));
      }
      
      if(phase === "end") {
        $(".atualiza_section").animate({
          top: "-150px"
        }, 300);
      }
    },
    threshold:0,
    maxTimeThreshold: 100,
    fingers:'all'
  });
  
  $(document).on("click","#BtnSair",function() {
    localStorage.clear();
    VerificaAuth();
  });
  
  $(document).on("click",".ModalSobralenseAbrir",function() {
    var title = $(this).attr("data-title");
    $(".ModalSobralenseClose span").text(title);
    $("header").hide();
    $(".ModalSobralense").fadeIn();
  });

  $(document).on("click",".ModalSobralenseBtnClose",function() {
    $(".ModalSobralense").fadeOut();
    $(".ModalSobralenseClose span").text("");
    $(".ModalSobralenseContent").html("");
    $("header").show();
  });
  
  $(document).on("click","[data-a=navegar]", function() {
    var page 		= $(this).attr("data-src");
    var title 	= $(this).attr("data-title");
    if (page !== "perfil") {
      $("section#perfil").html("");
    }
    
    if (page === "inicio") {
      $("#btn_postar_mais").show();
    } else {
      $("#btn_postar_mais").hide();
    }
    
    $("header .title span.txt").text(title);
    $("footer a").removeClass("active");
    $(this).addClass("active");
    $("section.pagina").fadeOut();
    $("section#"+page).fadeIn();
    var data_load = $("section#"+page).attr("data-load");
    if (data_load === "n" || page==="perfil") {
      var retorno = Ajax("./pages/"+page+".html","","GET","");
      
      if (retorno === "erro_404") {
        $("section#"+page).html("<br><br><center>Página não encontrada!</center>");
      } else {
        $("#info_geral").attr("data-pagina-atual",page);
        $("section#"+page).html(retorno);
        $("section#"+page).attr("data-load","s");
      }
      
      if (page === "inicio" || page === "perfil") {
        if (page === "perfil") {
          var id = $(this).attr("data-id");
          Perfil(id);
        }
        Timeline(0);
      }
      
    }
    
   
 });
 
  $(document).on("click",".tab .tab-item", function() {
    var div = $(this).attr('data-rel');
    $(".tab .tab-item").removeClass("active");
    $(this).addClass("active");
    $(".tab .tab_content").addClass("hide");
    $(".tab "+div).removeClass("hide");
  });
  
  $(document).on("click","[data-a=acao]", function() {
    var token = localStorage.getItem("aute_token");
    var id = $(this).attr("data-id");
    var acao = $(this).attr("data-type");
    
    if (acao === "curtir_timeline") {
      $(this).text("...").prop("disabled",true);
      $.ajax({
        type: "GET",
        context: this,
        url: PATH_API+"curtir.php?token="+token+"&id="+id+"&tipo=posts",
        success: function(data) {
          var html = "";
          var k = $.parseJSON(data);
          if (k.status === "success") {
            if (k.item.acao === "curtiu") {
              var icon = "fa-success";
            } else {
              var icon = "";
            }

            html = "<a class='btn' data-a='acao' data-type='curtir_timeline' data-id='"+id+"'>";
            html += "<i class='fa fa-thumbs-up "+icon+"'></i> ";
            if (k.item.total_likes > 0) html += " <small>"+k.item.total_likes+"</small>"; 
            html += "</a>" +
            "<a class='btn' data-a='acao' data-type='box_comentar' data-id='"+id+"' data-open='n'><i class='fa fa-comment'></i> ";
            if (k.item.total_comen > 0) html += " <small id='box_total_comentarios_"+id+"'>"+k.item.total_comen+"</small>"; 
            html += "</a>";
            $(this).parent().html(html);
          } else {
            alert(k.log);
          }
        }
      });
    }
    
    if (acao === "info_timeline") {
      var cria_tabs = "<div class='tab btn-group btn-group-justified'>"+
      "<button type='button' class='btn btn-default tab-item active ' style='width: 50% !important;' data-rel='.tab_content_one'>Curtidas <span id='total_curtidas'></span></button>"+
      "<button type='button' class='btn btn-default tab-item' style='width: 50% !important;' data-rel='.tab_content_two'>Comentários <span id='total_comentarios'></span></button>"+
      "<div class='tab_content tab_content_one'><ul class='listview_dinamic'></ul></div><div class='tab_content tab_content_two hide'><ul class='listview_dinamic'></ul></div></div>";

      $(".ModalSobralenseContent").html(cria_tabs);
      $.ajax({
        type: "GET",
        context: this,
        url: PATH_API+"lista_quem_curtiu.php?token="+token+"&id="+id,
        success: function(data) {
          var code = $("#info_usuario").attr("data-usuario-code");
          var html = "";
          var k2 = $.parseJSON(data);
          var t_cur = k2.total_curtidas;
          var t_com = k2.total_comentarios;
          if (t_cur > 0) $(".tab #total_curtidas").text("("+t_cur+")"); else $(".tab #total_curtidas").text("");
          if (t_com > 0) $(".tab #total_comentarios").text("("+t_com+")"); else $(".tab #total_comentarios").text("");

          var html = "";
          $.each(k2.item_cur, function(p,k) {
            html += "<li><a href='#'><img src='"+k.img_perfil+"' height='80' width='80'> <span style='line-height: 50px;'>"+k.usuario+"</span></a></li>";
          });

          var html2 = "";
          $.each(k2.item_com, function(p,k) {
            html2 += "<li id='comentario"+k.id+"'><a href='#'><img src='"+k.img_perfil+"' height='80' width='80'> <span>"+k.usuario+"<br><small>"+k.comentario+"</small></span>";
            if (code === k.id_usuario) html2 += "<i class='material-icons close' style='margin-top: -40px;' data-a='acao' data-type='remover' data-id='"+k.id+"' data-src='comentario' data-content='#comentario"+k.id+"'>close</i>";
            html2 += "</a></li>";
          });

          $(".tab .tab_content_one ul").html(html);
          $(".tab .tab_content_two ul").html(html2);
        }
      });
    }
    
    if (acao === "remover") {
      if (confirm("Tem certeza que deseja fazer isso?","Sobralense")) {
        var tipo = $(this).attr("data-src");
        var div	 = $(this).attr("data-content");
        $.ajax({
          url: PATH_API+"remove_acao.php?token="+token+"&id="+id+"&tipo="+tipo,
          type: "GET",
          async: false,
          success: function(data) {
            var k = $.parseJSON(data);
            if (k.status === "success") {
              $(div).fadeOut("slow");
            } else {
              alert(k.log);
            }
          }
        });
        return false;
      }
    }
    
    if (acao === "box_comentar") {
      $(".box_comentar").remove();
      var status = $(this).attr("data-open");
      if (status === "n") {
        $(this).attr("data-open","y");
        var html = BoxComentar(id);
        $("#box_post_"+id).append(html);

      } else {
        $(this).attr("data-open","n");
        $("#box_comentar_"+id).remove();
      }
    }
    
    if (acao === "comentar") {
      var mensagem = $("#input_mensagem_comentar").val();
      var url = PATH_API+".comentar.php?token="+token+"&mensagem="+mensagem+"&id="+id;
      var retorno = Ajax(url,"","GET",this);
      var k = $.parseJSON(retorno);
      $(this).attr("data-open","n");
      $("#box_comentar_"+id).remove();
      $("#box_total_comentarios_"+id).text(k.total_comentarios);
      return false;
    }
    
    if (acao === "seguir_usuario") {
      var url = PATH_API+"seguir.php?token="+token+"&id="+id;
      var retorno = Ajax(url,"","GET",this);
      var re = retorno.split("|");
      if (re[0] === "sucessocurtiu") {
        $(this).html("<i class='fa fa-check fa-white'></i> seguindo</button>");
        $(this).removeClass("btn-raised");
      }
      if (re[0] === "sucessodescurtiu") {
        $(this).html("<i class='fa fa-check fa-white'></i> seguir</button>");
        $(this).addClass("btn-raised");
      }
      $(".pagina_perfil .topo .opcoes #total_seguidores").html(re[1]);
    }
  });
  
  /*
  $(document).on("click","#btn_postar",function () { //fazer postagem na timeline
    var usuario = $("#hide_usuario").val();
    var pagina = $("#hide_pagina").val();
    var mensagem = $("#input_mensagem_postar").val();

    if (!mensagem) {
      $("#input_mensagem_postar").focus();
      return false;
    }

    $.ajax({
      url: PATH_API+"postar.php?mensagem="+mensagem+"&para="+usuario+"&pagina="+pagina,
      async: true,
      success: function(data) {
        var k = $.parseJSON(data);
        if (k.status === "success") {
          $("#input_mensagem_postar").val("");
          Timeline(k.id_post);

        } else {
          alert(k.log);
        }
      }
    });
    return false;
  });
  */

  $(document).on("keyup","#input_buscar", function(event) {
    var buscar = $(this).val();

     if (buscar.length >= 2) {

       Explorar(buscar);
     } else if (buscar.length === 0) {
       Explorar();
     }
  });
  
  $(document).on("click",".btn_postar_mais", function() {
    var html= Ajax("./pages/nova_post.html","","GET","");
    html = html.replace("{{img_perfil}}",localStorage.getItem("aute_img_perfil"));
    html = html.replace("{{usuario}}",localStorage.getItem("aute_nome"));
    html = html.replace("{{token}}",localStorage.getItem("aute_token"));
    html = html.replace("{{pagina}}",$("#info_geral").attr("data-pagina-atual"));
    $(".ModalSobralenseContent").html(html);
  });
  
});

function Ajax(url,data,type,selector) {
  var result = "";
  $.ajax({
    url: url,
    data: data,
    async: false,
    type: type,
    context: selector,
    success: function(data) {
      result = data;
    },
    error: function(data) {
      result = "erro_404";
    }
  });
  return result;
}

function VerificaAuth() {
  var a = localStorage.getItem("aute_status");
  var b = localStorage.getItem("aute_id");
  var c = localStorage.getItem("aute_email");
  var d = localStorage.getItem("aute_usuario");
  var e = localStorage.getItem("aute_token");
  var f = localStorage.getItem("aute_img_perfil");
  if (a && b && c && d && e) {
      $("#info_usuario").attr("data-usuario-usuario",d);
      $("#info_usuario").attr("data-usuario-code",b);
      $("#info_usuario").attr("data-usuario-img-perfil",f);
      $("#info_usuario").attr("data-usuario-usuario",d);          
  } else {
    document.location='./login.html';
  }
}

function Timeline(ult_post) {
	var token = localStorage.getItem("aute_token");
	var usuario = $("#hide_usuario").val();
  var pagina = $("#hide_pagina").val();
  var last = $("#hide_paginacao").val();
  var url = PATH_API+"timeline.php?token="+token+"&last="+ last + "&usuario=" + usuario + "&pagina=" + pagina + "&ult_post=" + ult_post;
  
	$.ajax({
		type: "GET",
  	url: url,
  	dataType: "json",
  	async: false,
  	success: function(data) {
  		var html = "";
  		if (data.length > 0) {
  			$.each(data, function(p,k) {
  				html += "<div id='box_post_"+k.id+"' class='box "; if (ult_post) html+= "ult_post"; html += "'>" +
										"<div class='timeline_header'>" +
											"<a href='#' data-a='navegar' data-src='perfil' data-id='"+k.id_usuario+"'><img src='"+k.img_perfil+"' height='40' width='40' class='pull-left img-circle' /></a>" +
											"<div class='timeline_title'>";
												
												html += "<span><a href='#' data-a='navegar' data-src='perfil' data-id='"+k.id_usuario+"'>"+k.usuario+"</a></span>" +
												"<small class='pull-right'>"+k.data_atras+"</small>" +
											"</div>" +
										"</div>" +
										"<div class='timeline_content'>" +
											"<div class='text'>" +
												k.mensagem +
											"</div>";
											if (k.img_post) { html += "<div class='timeline_img'><center><img src='"+k.img_post+"' class='img-responsive mt-sm' /></center></div>"; }
											html += "</div>" +
										"<div class='timeline_footer btn-group' role='group'><div class='actions pull-left'>" +
											"<a class='btn' data-a='acao' data-type='curtir_timeline' data-id='"+k.id+"'>";
											if (k.curtiu === "s") html += "<i class='fa fa-thumbs-up fa-success'></i>";
											else html += "<i class='fa fa-thumbs-up'></i> ";
											html += " ";
											if (k.total_likes > 0) html += "<small>"+k.total_likes+"</small>"; 
											html += "</a>" +
											"<a class='btn' data-a='acao' data-type='box_comentar' data-id='"+k.id+"' data-open='n'><i class='fa fa-comment'></i> ";
											if (k.total_comen > 0) html += "<small id='box_total_comentarios_"+k.id+"'>"+k.total_comen+"</small>"; 
											html += "</a></div><div class='pull-right'><a class='btn ModalSobralenseAbrir' data-title='Detalhes...' data-a='acao' data-type='info_timeline' data-id='"+k.id+"'><i class='fa fa-info'></i>&nbsp;</a>";
                      if (k.meu==="s") html += "<a class='btn' data-a='acao' data-type='remover' data-id='"+k.id+"' data-src='post' data-content='#box_post_"+k.id+"'><i class='fa fa-close'></i>&nbsp;</a>";
                      
										html += "</div></div>" +
									"</div>";
  			});

  			
        var pag = parseFloat(last) + 1;
        $("#hide_paginacao").val(pag);
        
  		} else {
  			$(".btn-carregar-mais").html("");
  		}

  		if (!ult_post || ult_post==='undefined')
				$(document).find(".show_timeline").append(html);
			else {
				$(document).find(".show_timeline").removeClass("ult_post");
				$(document).find(".show_timeline").prepend(html);
				$(document).find(".show_timeline .ult_post").hide().fadeIn("slow");
			}
  	},
    error: function(data, textStatus, jqXHR) {
      console.log(data.error);
    }
  });
}

function BoxComentar(id) {
	var img = $("#info_usuario").attr("data-usuario-img-perfil");
	html = "<form id='box_comentar_"+id+"' class='box_comentar'>" +
            "<div class='box_postar_timeline_foto'>" +
              "<img src='"+img+"' height='50' width='50' class='img-circle' />" +
            "</div>" +
            "<div class='box_postar_timeline_input'>" +
              "<textarea id='input_mensagem_comentar' placeholder='Deixe seu comentário...'></textarea>" +
            "</div>" +
            "<div class='box_postar_timeline_submit'>" +
              "<button class='btn btn-success' id='btn_comentar' data-a='acao' data-type='comentar' data-id='"+id+"'><i class='fa fa-white fa-send'></i></button>" +
            "</div>" +
          "</form>";
	return html;
}

function Explorar(busca) {
  var token = localStorage.getItem("aute_token");
  if (busca!=="") {
    var last = 1;
  } else {
    var last = $("#hide_paginacao").val();
  }
	
	var url = PATH_API+"explorar.php?token="+token+"&last="+last+"&busca="+busca;
	var retorno = Ajax(url,"","GET",this);
	retorno = $.parseJSON(retorno);
	var html = "";
	var last;
	if (retorno.length > 0) { 
		$.each(retorno, function(p,k) {
			html += "<div class='col-xs-4 explorar_item'><a href='#' data-a='navegar' data-src='perfil' data-id='"+k.id+"'>"+
			"<img src='"+k.img_perfil+"' class='img-responsive'><span class='nome'>"+k.nome+"</span>"+
			"</a></div>";
		});
		var pag = parseFloat(last) + 1;
		$("#hide_paginacao").val(pag);
	} else {
		$(".btn-carregar-mais").html("");
	}

	if (busca)
		$(".pagina_explorar .lista").html(html);
	else
		$(".pagina_explorar .lista").append(html);
}

function Perfil(id) {
  var token = localStorage.getItem("aute_token");
  var eu = localStorage.getItem("aute_id");
  var retorno = Ajax(PATH_API+"perfil.php?token="+token+"&id="+id,"","GET","");
  var k = $.parseJSON(retorno);
  $("#hide_usuario").val(k.id);
  $(".pagina_perfil .topo").css("background-image","url("+k.img_capa+")");
  $(".pagina_perfil .topo .foto").html("<img src='"+k.img_perfil+"' height='80' width='80' class='img-thumbnail img-circle' />");
  $(".pagina_perfil .topo .titulo").html(k.nome+"<br><small>@"+k.usuario+" | "+k.bairro+" | "+k.sexo+" | "+k.idade+" anos</small>");
  $(".pagina_perfil .topo .opcoes #total_seguidores").html(k.total_seguidores);
  $(".pagina_perfil .topo .opcoes #total_seguindo").html(k.total_seguindo);
  if (eu !== k.id) {
    $(".pagina_perfil .topo .opcoes2").show();
    $(".pagina_perfil .topo .opcoes2 .btn-seguir").attr("data-id",k.id);
    if (k.segue==="n") {
      $(".pagina_perfil .topo .opcoes2 .btn-seguir").addClass("btn-raised");
      $(".pagina_perfil .topo .opcoes2 .btn-seguir").html("<i class='fa fa-check fa-white btn-raised'></i> seguir");
    } else {
      $(".pagina_perfil .topo .opcoes2 .btn-seguir").html("<i class='fa fa-check fa-white'></i> seguindo");
    }
  }
  
}