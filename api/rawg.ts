export async function GET(
  request: Request
): Promise<Response> {

  try {

    const requestUrl =
      new URL(request.url);

    const search =
      requestUrl.searchParams
        .get('search')
        ?.trim();

    if (!search) {

      return Response.json(
        {
          error:
            'El parámetro search es obligatorio.'
        },
        {
          status: 400
        }
      );

    }


    const apiKey =
      process.env['RAWG_API_KEY'];

    if (!apiKey) {

      console.error(
        'RAWG_API_KEY no está configurada.'
      );

      return Response.json(
        {
          error:
            'RAWG API no está configurada.'
        },
        {
          status: 500
        }
      );

    }


    const requestedPageSize =
      Number(
        requestUrl.searchParams
          .get('page_size') ?? 12
      );


    const pageSize =
      Number.isFinite(requestedPageSize)
        ? Math.min(
            Math.max(
              requestedPageSize,
              1
            ),
            40
          )
        : 12;


    const rawgUrl =
      new URL(
        'https://api.rawg.io/api/games'
      );


    rawgUrl.searchParams.set(
      'key',
      apiKey
    );

    rawgUrl.searchParams.set(
      'search',
      search
    );

    rawgUrl.searchParams.set(
      'page_size',
      pageSize.toString()
    );


    const rawgResponse =
      await fetch(
        rawgUrl.toString(),
        {
          headers: {
            Accept:
              'application/json'
          }
        }
      );


    if (!rawgResponse.ok) {

      const rawgError =
        await rawgResponse.text();


      console.error(
        'RAWG respondió con error:',
        rawgResponse.status,
        rawgError
      );


      return Response.json(
        {
          error:
            'RAWG no pudo procesar la búsqueda.'
        },
        {
          status:
            rawgResponse.status
        }
      );

    }


    const data =
      await rawgResponse.json();


    return Response.json(
      data,
      {
        status: 200,

        headers: {

          /*
           * Podemos cachear búsquedas durante
           * unos minutos para ahorrar peticiones
           * contra RAWG.
           */
          'Cache-Control':
            'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );

  } catch (error) {

    console.error(
      'Error consultando RAWG:',
      error
    );


    return Response.json(
      {
        error:
          'Error interno consultando RAWG.'
      },
      {
        status: 500
      }
    );

  }

}