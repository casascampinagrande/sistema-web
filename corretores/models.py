from django.db import models
from django.contrib.auth.models import User

class Corretor(models.Model):
    # Conecta com o sistema de login padrão do Django (Email e Senha)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    nome = models.CharField(max_length=150)
    creci = models.CharField(max_length=20, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    cpf_cnpj = models.CharField(max_length=20, unique=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} - {self.creci}"
    

class Anuncio(models.Model):
    # Tipos de contrato
    FINALIDADE_CHOICES = [
        ('venda', 'Venda'),
        ('aluguel', 'Aluguel'),
    ]

    # Relacionamento: Se o usuário for deletado, os anúncios dele também serão
    corretor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='anuncios')
    
    # Dados básicos
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=12, decimal_places=2)
    cidade = models.CharField(max_length=100)
    bairro = models.CharField(max_length=100)
    
    # Detalhes do imóvel
    quartos = models.PositiveIntegerField(default=0)
    banheiros = models.PositiveIntegerField(default=0)
    vagas_garagem = models.PositiveIntegerField(default=0)
    area_m2 = models.FloatField()
    
    finalidade = models.CharField(max_length=10, choices=FINALIDADE_CHOICES, default='venda')
    
    # Controle
    data_criacao = models.DateTimeField(auto_now_add=True)
    ativo = models.BooleanField(default=True)
    
    # Foto Principal (Depois podemos fazer uma galeria separada)
    imagem_capa = models.ImageField(upload_to='anuncios/', null=True, blank=True)

    def __str__(self):
        return f"{self.titulo} - {self.cidade}"