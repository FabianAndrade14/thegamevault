export default {

  async fetch(
    request: Request
  ): Promise<Response> {

    try {

      const url =
        new URL(request.url);


      const search =
        url.searchParams
          .get('search')
          ?.trim();


      if (!search) {

        return Response.json(
          {
            ok: false,
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
      // VALIDAR VARIABLE DE ENTORNO
      // =====================================

      const apiKey =
        process.env['RAWG_API_KEY']
          ?.trim();


      if (!apiKey) {

        console.error(
          '[RAWG] RAWG_API_KEY no existe en el runtime.'
        );


        return Response.json(
          {
            ok: false,
            code: 'RAWG_API_KEY_MISSING',
            message:
              'RAWG_API_KEY no está configurada en Vercel.'
          },
          {
            status: 500
          }
        );

      }


      console.log(
        '[RAWG] Variable encontrada:',
        true
      );


      // =====================================
      // PAGE SIZE
      // =====================================

      const requestedPageSize =
        Number(
          url.searchParams
            .get('page_size') ?? 12
        );


      const pageSize =
        Number.isFinite(
          requestedPageSize
        )
          ? Math.min(
              Math.max(
                requestedPageSize,
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


      console.log(
        '[RAWG] Consultando RAWG para:',
        search
      );


      // =====================================
      // REQUEST
      // =====================================

      const rawgResponse =
        await fetch(
          rawgUrl,
          {
            method: 'GET',

            headers: {
              Accept:
                'application/json'
            }
          }
        );


      console.log(
        '[RAWG] Status upstream:',
        rawgResponse.status
      );


      const responseText =
        await rawgResponse.text();


      // =====================================
      // RAWG ERROR
      // =====================================

      if (!rawgResponse.ok) {

        console.error(
          '[RAWG] Error upstream:',
          rawgResponse.status,
          responseText
        );


        return Response.json(
          {
            ok: false,
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
      // PARSE JSON
      // =====================================

      let data: unknown;


      try {

        data =
          JSON.parse(
            responseText
          );

      } catch {

        console.error(
          '[RAWG] RAWG devolvió JSON inválido.'
        );


        return Response.json(
          {
            ok: false,
            code:
              'RAWG_INVALID_RESPONSE'
          },
          {
            status: 502
          }
        );

      }


      // =====================================
      // RESPONSE
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
        '[RAWG] Proxy exception:',
        error
      );


      return Response.json(
        {
          ok: false,
          code:
            'RAWG_PROXY_EXCEPTION',

          message:
            error instanceof Error
              ? error.message
              : 'Unknown error'
        },
        {
          status: 500
        }
      );

    }

  }

};