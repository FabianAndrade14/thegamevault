export async function GET(
  request: Request
): Promise<Response> {

  try {

    // =====================================
    // REQUEST URL
    // =====================================

    const requestUrl =
      new URL(request.url);


    // =====================================
    // SEARCH
    // =====================================

    const search =
      requestUrl.searchParams
        .get('search')
        ?.trim();


    if (!search) {

      return Response.json(
        {
          success: false,
          code: 'SEARCH_REQUIRED',
          message:
            'El parámetro search es obligatorio.'
        },
        {
          status: 400
        }
      );

    }


    // =====================================
    // RAWG API KEY
    // =====================================

    const apiKey =
      process.env['RAWG_API_KEY']
        ?.trim();


    /*
     * Solo mostramos si existe o no.
     * NUNCA imprimimos la API Key.
     */
    console.log(
      '[RAWG] API key cargada:',
      Boolean(apiKey)
    );


    if (!apiKey) {

      console.error(
        '[RAWG] RAWG_API_KEY no está configurada.'
      );


      return Response.json(
        {
          success: false,
          code:
            'RAWG_API_KEY_MISSING',
          message:
            'RAWG_API_KEY no está configurada.'
        },
        {
          status: 500
        }
      );

    }


    // =====================================
    // PAGE SIZE
    // =====================================

    const pageSizeParam =
      requestUrl.searchParams
        .get('page_size');


    const parsedPageSize =
      Number(
        pageSizeParam ?? 12
      );


    const pageSize =
      Number.isFinite(
        parsedPageSize
      )
        ? Math.min(
            Math.max(
              parsedPageSize,
              1
            ),
            40
          )
        : 12;


    // =====================================
    // RAWG URL
    // =====================================

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
      String(pageSize)
    );


    // =====================================
    // LOG
    // =====================================

    console.log(
      `[RAWG] Buscando: ${search}`
    );


    console.log(
      '[RAWG] URL preparada correctamente.'
    );


    // =====================================
    // FETCH RAWG
    // =====================================

    const rawgResponse =
      await fetch(
        rawgUrl.toString(),
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json'
          }
        }
      );


    console.log(
      '[RAWG] Status:',
      rawgResponse.status
    );


    // =====================================
    // RAWG ERROR
    // =====================================

    if (!rawgResponse.ok) {

      const errorBody =
        await rawgResponse.text();


      console.error(
        '[RAWG] Error RAWG:',
        rawgResponse.status,
        errorBody
      );


      return Response.json(
        {
          success: false,
          code:
            'RAWG_UPSTREAM_ERROR',
          upstreamStatus:
            rawgResponse.status,
          message:
            'RAWG rechazó la petición.'
        },
        {
          status: 502
        }
      );

    }


    // =====================================
    // RESPONSE JSON
    // =====================================

    const data =
      await rawgResponse.json();


    console.log(
      `[RAWG] Búsqueda "${search}" completada correctamente.`
    );


    // =====================================
    // RETURN
    // =====================================

    return Response.json(
      data,
      {
        status: 200,

        headers: {
          'Cache-Control':
            'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );


  } catch (error) {

    console.error(
      '[RAWG] Error interno:',
      error
    );


    return Response.json(
      {
        success: false,
        code:
          'RAWG_PROXY_EXCEPTION',

        message:
          error instanceof Error
            ? error.message
            : 'Error desconocido.'
      },
      {
        status: 500
      }
    );

  }

}