# Roteiros das narrações (ElevenLabs, eleven_v4, voz "Marcio - Viral Hook Narrator")

## Mirante 41
[curious] Sabe por que imóvel de alto padrão não vende pela internet? [short pause] Porque o site parece um folheto. [excited] Olha esse aqui: conforme você rola, a torre sobe andar por andar… e a tarde vira noite, do jeito que o cliente vai ver da varanda. Planta, diferenciais e agendamento de visita, tudo numa página só. [warmly] Quer um site assim pro seu empreendimento? Me chama no direct.

## Lenha (ainda sem áudio)
[curious] Como é que você vende o cheiro da brasa pela internet? [short pause] Não vende. [excited] Você mostra o fogo. Esse site abre com fogo de verdade, feito em código. O menu desliza prato por prato… e um termômetro mostra a temperatura de cada técnica. No final, o cliente escolhe a data e já reserva. [warmly] Quer um site assim pro seu restaurante? Me chama no direct.

## Lúmen Dermatologia
[curious] Por que o paciente escolhe a clínica do lado? [short pause] Porque o seu site é igual a todos os outros. [excited] Olha esse: abre com uma gota de sérum em 3D… e enquanto a pessoa rola, a pele se renova, do dia um ao dia vinte e oito. Tratamentos sem promessa milagrosa, e agenda de verdade, em dois toques. [warmly] Quer um site assim pra sua clínica? Me chama no direct.

## Como gerar o vídeo
python3 sites/videos/align.py <narracao.mp3> "<roteiro>" <slug>.words.json
node sites/videos/record.js <slug> <narracao.mp3> <slug>.words.json <saida.mp4>
